"use client";

import { ChangeEvent, DragEvent, useId, useRef, useState } from "react";

import {
  analyzeResponseSchema,
  type AnalyzeResponse,
  type DeskAnalysis,
} from "@/lib/analysis";
import { prepareImage, type PreparedImage } from "@/lib/image";
import { styleDefinitions, type StyleId } from "@/lib/styles";

const steps = [
  "Inspecting the surface",
  "Finding quick wins",
  "Building your plan",
  "Visualizing your reset",
];

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none">
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
      <path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" fill="currentColor" />
    </svg>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#2f6b5b" : score >= 50 ? "#d68b25" : "#ba5547";
  return (
    <div
      className="grid h-32 w-32 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #e7ebe5 0deg)` }}
      aria-label={`Organization score: ${score} out of 100`}
    >
      <div className="grid h-24 w-24 place-items-center rounded-full bg-[#fffdf8] text-center">
        <div>
          <div className="text-4xl font-bold tracking-tight">{score}</div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#61736e]">score</div>
        </div>
      </div>
    </div>
  );
}

function Results({
  analysis,
  resultImage,
  mode,
  styleName,
  onReset,
}: {
  analysis: DeskAnalysis;
  resultImage: AnalyzeResponse["resultImage"];
  mode: AnalyzeResponse["mode"];
  styleName: string;
  onReset: () => void;
}) {
  const totalMinutes = analysis.tasks.reduce(
    (sum, task) => sum + task.estimatedMinutes,
    0,
  );

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8" aria-live="polite">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-1 text-sm font-bold uppercase leading-5 tracking-[0.18em] text-[#2f6b5b]">
            Your reset plan <span className="inline-flex h-4 w-4 items-center justify-center"><SparkIcon /></span>
          </div>
          <p className="mb-2 text-sm font-semibold text-[#61736e]">
            {styleName} style
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
            A clearer desk, one task at a time.
          </h2>
        </div>
        <button
          onClick={onReset}
          className="rounded-full border border-[#cbd5cc] bg-white px-5 py-2.5 text-sm font-bold transition hover:border-[#2f6b5b] hover:text-[#2f6b5b]"
        >
          Analyze another desk
        </button>
      </div>

      {mode === "demo" && (
        <div className="mb-5 rounded-2xl border border-[#efd49b] bg-[#fff8e7] px-4 py-3 text-sm text-[#72551d]">
          Demo mode is on. This sample response verifies the full interface while API credentials are being configured.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.4fr]">
        <div className="space-y-5">
          <article className="flex flex-col items-center gap-6 rounded-[2rem] border border-[#dfe5dd] bg-[#fffdf8] p-7 text-center shadow-[0_20px_60px_rgba(34,68,58,0.08)] sm:flex-row sm:text-left">
            <ScoreRing score={analysis.score} />
            <div>
              <p className="text-lg font-semibold leading-7">{analysis.summary}</p>
              <p className="mt-3 text-sm text-[#61736e]">
                About {totalMinutes} minutes across {analysis.tasks.length} focused tasks.
              </p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[#dfe5dd] bg-white/70 p-6">
            <h3 className="mb-4 font-bold">What stood out</h3>
            <div className="space-y-3">
              {analysis.observations.map((item, index) => (
                <div key={`${item.category}-${index}`} className="flex gap-3 border-b border-[#e7ebe5] pb-3 last:border-0 last:pb-0">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.severity === "high" ? "bg-[#ba5547]" : item.severity === "medium" ? "bg-[#f2b84b]" : "bg-[#7ca697]"}`} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#61736e]">{item.category}</p>
                    <p className="mt-1 text-sm leading-6">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="rounded-[2rem] border border-[#dfe5dd] bg-[#18312b] p-6 text-white shadow-[0_20px_60px_rgba(24,49,43,0.14)] sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a8c4b9]">Prioritized checklist</p>
              <h3 className="mt-1 text-2xl font-bold">Start with the first win</h3>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm">{totalMinutes} min</span>
          </div>
          <ol className="space-y-3">
            {analysis.tasks.map((task, index) => (
              <li key={`${task.title}-${index}`} className="group flex gap-4 rounded-2xl bg-white/[0.07] p-4 transition hover:bg-white/[0.11]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f2b84b] font-bold text-[#18312b]">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h4 className="font-bold">{task.title}</h4>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-[#d6e3de]">{task.estimatedMinutes} min</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-[#c3d4cd]">{task.reason}</p>
                </div>
              </li>
            ))}
          </ol>
          {analysis.safetyNotes.length > 0 && (
            <div className="mt-5 rounded-2xl border border-[#f2b84b]/35 bg-[#f2b84b]/10 p-4">
              <p className="text-sm font-bold text-[#ffd980]">Safety first</p>
              {analysis.safetyNotes.map((note) => (
                <p key={note} className="mt-1 text-sm text-[#f9e7bd]">{note}</p>
              ))}
            </div>
          )}
        </article>
      </div>

      {resultImage ? (
        <article className="mt-5 overflow-hidden rounded-[2rem] border border-[#dfe5dd] bg-white/70 p-5 shadow-[0_20px_60px_rgba(34,68,58,0.08)] sm:p-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2f6b5b]">Style inspiration</p>
              <h3 className="mt-1 text-2xl font-bold">Your desk vibe, visualized</h3>
            </div>
            <a
              href={resultImage}
              download="cleardesk-organized-desk.jpg"
              className="rounded-full border border-[#cbd5cc] bg-white px-4 py-2 text-sm font-bold transition hover:border-[#2f6b5b] hover:text-[#2f6b5b]"
            >
              Download image
            </a>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
          <img
            src={resultImage}
            alt="A decoration suggestion for your desk"
            className="max-h-[640px] w-full rounded-2xl bg-[#edf3ef] object-contain"
          />
        </article>
      ) : (
        <p className="mt-5 rounded-2xl border border-[#dfe5dd] bg-white/70 px-5 py-4 text-sm text-[#61736e]">
          A decoration suggestion is unavailable because the photo could not be identified as a desk.
        </p>
      )}
    </section>
  );
}

export function DeskAnalyzer() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [styleId, setStyleId] = useState<StyleId>(styleDefinitions[0].id);
  const [resultStyleId, setResultStyleId] = useState<StyleId | null>(null);

  async function acceptFile(file?: File) {
    if (!file) return;
    setError("");
    setResult(null);
    setResultStyleId(null);
    setIsPreparing(true);
    try {
      const prepared = await prepareImage(file);
      setImage(prepared);
      setFileName(file.name);
    } catch (caught) {
      setImage(null);
      setFileName("");
      setError(caught instanceof Error ? caught.message : "We could not prepare that image.");
    } finally {
      setIsPreparing(false);
    }
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    void acceptFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void acceptFile(event.dataTransfer.files?.[0]);
  }

  function reset() {
    setImage(null);
    setFileName("");
    setResult(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function analyze() {
    if (!image) return;
    setError("");
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: image.dataUrl, styleId }),
      });
      const json: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof json === "object" && json && "error" in json
            ? String(json.error)
            : "Analysis failed.";
        throw new Error(message);
      }
      const parsed = analyzeResponseSchema.parse(json);
      setResult(parsed);
      setResultStyleId(styleId);
      window.setTimeout(
        () => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not analyze this photo.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#18312b] text-[#f2b84b]"><SparkIcon /></span>
          <div>
            <p className="text-lg font-bold tracking-[-0.03em]">ClearDesk</p>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-16 pt-8 sm:px-8 md:pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <h1 className="max-w-xl text-5xl font-bold leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
            Turn desk chaos into <span className="text-[#2f6b5b]">clear next steps.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#61736e]">
            Share one photo. Get an organization score and a practical plan ordered by what will make the biggest difference first.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#486159]">
            {["One photo", "Under a minute", "Actionable tasks"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f2b84b]" />{item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="animate-drift absolute -right-7 -top-8 hidden h-20 w-20 rotate-6 rounded-[1.6rem] bg-[#f2b84b] p-4 text-sm font-bold leading-4 text-[#513b14] shadow-lg sm:block">
            Start small.<br />Feel lighter.
          </div>
          <div className="rounded-[2.25rem] border border-white/80 bg-white/75 p-3 shadow-[0_30px_90px_rgba(34,68,58,0.14)] backdrop-blur">
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className={`relative overflow-hidden rounded-[1.7rem] border-2 border-dashed transition ${image ? "border-[#b6c9bf] bg-[#edf3ef]" : "border-[#cbd5cc] bg-[#faf9f4] hover:border-[#2f6b5b] hover:bg-[#f4f7f2]"}`}
            >
              {image ? (
                <div className="relative min-h-[390px]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local Base64 preview */}
                  <img src={image.dataUrl} alt="Selected desk preview" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 pt-20 text-white">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="max-w-[15rem] truncate font-semibold">{fileName}</p>
                        <p className="mt-1 text-xs text-white/75">
                          {image.width} × {image.height} · {formatBytes(image.outputBytes)} prepared
                        </p>
                      </div>
                      <button onClick={() => inputRef.current?.click()} className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-[#18312b] backdrop-blur transition hover:bg-white">
                        Replace photo
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-[390px] w-full flex-col items-center justify-center px-8 py-12 text-center">
                  <span className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#e6eee9] text-[#2f6b5b]"><UploadIcon /></span>
                  <span className="text-xl font-bold">Drop your desk photo here</span>
                  <span className="mt-2 max-w-xs text-sm leading-6 text-[#61736e]">or tap to choose a photo or use your phone camera</span>
                  <span className="mt-6 rounded-full bg-[#18312b] px-5 py-2.5 text-sm font-bold text-white shadow-md">Choose a photo</span>
                  <span className="mt-4 text-xs text-[#7b8c86]">JPEG, PNG, WebP or GIF · up to 12 MB</span>
                </button>
              )}
              {isPreparing && (
                <div className="absolute inset-0 grid place-items-center bg-[#fffdf8]/90">
                  <p className="animate-pulse-soft font-bold text-[#2f6b5b]">Preparing your photo…</p>
                </div>
              )}
            </div>

            <input ref={inputRef} id={inputId} type="file" accept="image/jpeg,image/png,image/webp,image/gif" capture="environment" onChange={handleFile} className="sr-only" />

            <fieldset className="mt-3 rounded-2xl border border-[#dfe5dd] bg-[#faf9f4] p-3">
              <legend className="px-1 text-xs font-bold uppercase tracking-[0.14em] text-[#61736e]">
                Choose your desk style
              </legend>
              <div className="mt-1 grid gap-2 sm:grid-cols-3">
                {styleDefinitions.map((style) => {
                  const selected = style.id === styleId;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setStyleId(style.id)}
                      className={`rounded-xl border px-3 py-3 text-left transition ${
                        selected
                          ? "border-[#2f6b5b] bg-[#e6eee9] text-[#18312b] shadow-sm"
                          : "border-transparent bg-white text-[#486159] hover:border-[#b6c9bf]"
                      }`}
                    >
                      <span className="block text-sm font-bold">{style.name}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#61736e]">
                        {style.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <button onClick={analyze} disabled={!image || isAnalyzing || isPreparing} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f6b5b] px-6 py-4 font-bold text-white shadow-[0_10px_25px_rgba(47,107,91,0.25)] transition hover:bg-[#214e43] disabled:cursor-not-allowed disabled:bg-[#9aaba5] disabled:shadow-none">
              {isAnalyzing ? "Analyzing your desk…" : <><SparkIcon /> Build my reset plan</>}
            </button>
          </div>
        </div>
      </section>

      {isAnalyzing && (
        <section className="mx-auto w-full max-w-4xl px-5 pb-16" aria-live="polite">
          <div className="rounded-[2rem] border border-[#dfe5dd] bg-white/70 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${index === 0 ? "animate-pulse-soft bg-[#2f6b5b] text-white" : "bg-[#e7ebe5] text-[#61736e]"}`}>{index + 1}</span>
                  <span className="text-sm font-semibold">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {error && (
        <div className="mx-auto mb-12 w-[calc(100%-2.5rem)] max-w-4xl rounded-2xl border border-[#e1aaa2] bg-[#fff0ed] px-5 py-4 text-sm font-semibold text-[#853e34]" role="alert">
          {error}
        </div>
      )}

      <div id="results">
        {result && resultStyleId && (
          <Results
            analysis={result.data}
            resultImage={result.resultImage}
            mode={result.mode}
            styleName={
              styleDefinitions.find((style) => style.id === resultStyleId)?.name ??
              "Selected"
            }
            onReset={reset}
          />
        )}
      </div>

      <footer className="border-t border-[#dfe5dd] px-5 py-7 text-center text-xs text-[#71817c]">
        ClearDesk analyzes only the photo you submit. The MVP does not intentionally store uploaded images.
      </footer>
    </main>
  );
}
