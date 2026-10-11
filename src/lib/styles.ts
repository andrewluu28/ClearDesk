import type { StyleVisualProfile } from "@/lib/style-profile";

type StyleDefinition = {
  id: string;
  slug: string;
  name: string;
  description: string;
  promptGuidance: string;
  visualProfile: StyleVisualProfile;
};

export const styleDefinitions = [
  {
    id: "ca0aa782-fdcb-448a-80c2-b29f0f730995",
    slug: "minimalist",
    name: "Minimalist",
    description: "Clear surfaces, few visible objects, and neutral organization.",
    promptGuidance:
      "Favor clear surfaces, concealed storage, simple groupings, and only essential objects in view. Keep the result neutral, calm, and uncluttered.",
    visualProfile: {
      keywords: ["airy", "intentional", "restrained", "concealed", "quiet"],
      requiredSignals: [
        "large areas of open work surface",
        "few visible objects",
        "concealed or consolidated storage",
        "cohesive neutral colors",
      ],
      conflictingSignals: [
        "scattered small objects",
        "duplicate containers",
        "exposed loose papers",
        "decorative clutter",
        "visible cable tangles",
      ],
      preferredObjects: [
        "slim neutral desk mat",
        "small lidded storage box",
        "single closed notebook",
        "minimal catchall tray",
      ],
      palette: ["warm white", "pale gray", "natural wood", "matte black"],
      materials: ["felt", "light wood", "matte metal", "stoneware"],
      maxNewItems: 2,
    },
  },
  {
    id: "b01ddbf3-61ab-4796-8eff-05bae2767507",
    slug: "cozy",
    name: "Cozy",
    description: "Warm, personal, and comfortable organization.",
    promptGuidance:
      "Create a warm and comfortable workspace. Keep a small number of meaningful personal items visible, use inviting groupings, and preserve the desk's existing character.",
    visualProfile: {
      keywords: ["warm", "tactile", "layered", "personal", "lived-in"],
      requiredSignals: [
        "warm layered lighting",
        "natural or soft texture",
        "curated personal objects",
        "comfortable usable work area",
      ],
      conflictingSignals: [
        "cold clinical lighting",
        "sterile empty surfaces",
        "uncontrolled clutter",
        "harsh corporate styling",
      ],
      preferredObjects: [
        "compact warm desk lamp",
        "small leafy plant",
        "framed personal photo or artwork",
        "fabric desk mat",
        "ceramic mug and coaster",
      ],
      palette: ["warm wood", "oatmeal", "muted sage", "soft amber"],
      materials: ["wood", "linen", "matte ceramic", "woven fiber"],
      maxNewItems: 3,
    },
  },
  {
    id: "0f52a223-f568-4299-af20-7edeea3dbec7",
    slug: "productivity",
    name: "Productivity",
    description: "Ergonomic, efficient, and work-focused organization.",
    promptGuidance:
      "Prioritize ergonomics and efficient access. Center the primary work setup, keep daily tools within easy reach, route cables cleanly, and reduce visual distractions.",
    visualProfile: {
      keywords: ["focused", "zoned", "ergonomic", "accessible", "precise"],
      requiredSignals: [
        "clearly defined work zones",
        "aligned primary equipment",
        "frequently used tools within reach",
        "controlled documents and cables",
      ],
      conflictingSignals: [
        "decorative distractions",
        "duplicate organizers",
        "blocked primary work area",
        "loose visible cables",
        "rarely used supplies in reach zones",
      ],
      preferredObjects: [
        "angled document stand",
        "compact focus timer",
        "cable management dock",
        "single action notebook",
        "supportive laptop or monitor riser",
      ],
      palette: ["charcoal", "desaturated blue-gray", "white", "natural wood"],
      materials: ["powder-coated metal", "felt", "matte plastic", "wood"],
      maxNewItems: 3,
    },
  },
] as const satisfies readonly StyleDefinition[];

export type StyleId = (typeof styleDefinitions)[number]["id"];

export function findStyleDefinition(styleId: string | null) {
  if (!styleId) return null;
  return styleDefinitions.find((style) => style.id === styleId) ?? null;
}
