const MAX_FILE_BYTES = 12 * 1024 * 1024;
const MAX_DIMENSION = 1_600;
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type PreparedImage = {
  dataUrl: string;
  width: number;
  height: number;
  originalBytes: number;
  outputBytes: number;
};

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("We could not read that image."));
    image.src = dataUrl;
  });
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("We could not read that file."));
    reader.readAsDataURL(file);
  });
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!SUPPORTED_TYPES.includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, WebP, or GIF image.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Choose an image smaller than 12 MB.");
  }

  const source = await readFile(file);
  const image = await loadImage(source);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser cannot resize this image.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  const base64Length = dataUrl.split(",")[1]?.length ?? 0;

  return {
    dataUrl,
    width,
    height,
    originalBytes: file.size,
    outputBytes: Math.ceil((base64Length * 3) / 4),
  };
}
