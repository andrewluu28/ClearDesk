"use client";

import { ChangeEvent, DragEvent, useEffect, useId, useRef, useState } from "react";

import {
  analyzeResponseSchema,
  type AnalyzeResponse,
  type DeskAnalysis,
} from "@/lib/analysis";
import { prepareImage, type PreparedImage } from "@/lib/image";
import {
  projectHistoryResponseSchema,
  saveProjectResponseSchema,
  savedProjectResponseSchema,
} from "@/lib/project-schema";
import { styleDefinitions, type StyleId } from "@/lib/styles";

const steps = [
  "Inspecting the surface",
  "Finding quick wins",
  "Building your plan",
  "Visualizing your reset",
];
const MIN_PROGRESS_DURATION_MS = 2_800;
const PROGRESS_STEP_INTERVAL_MS = 700;
type HistoryProject =
  ReturnType<typeof projectHistoryResponseSchema.parse>["projects"][number];

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getResponseError(json: unknown, fallback: string) {
  return typeof json === "object" && json && "error" in json
    ? String(json.error)
    : fallback;
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
  projectSaveNotice,
  completedTasks,
  onToggleTask,
  onReset,
}: {
  analysis: DeskAnalysis;
  resultImage: AnalyzeResponse["resultImage"];
  mode: AnalyzeResponse["mode"];
  styleName: string;
  projectSaveNotice: string;
  completedTasks: boolean[];
  onToggleTask: (index: number) => void;
  onReset: () => void;
}) {
  const completedCount = completedTasks.filter(Boolean).length;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8" aria-live="polite">
      {projectSaveNotice && (
        <p
          className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
            projectSaveNotice.startsWith("This result could not be saved")
              ? "border-[#efd49b] bg-[#fff8e7] text-[#72551d]"
              : "border-[#b6c9bf] bg-[#edf3ef] text-[#214e43]"
          }`}
          role={
            projectSaveNotice.startsWith("This result could not be saved")
              ? "alert"
              : "status"
          }
        >
          {projectSaveNotice}
        </p>
      )}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-1 text-sm font-bold uppercase leading-5 tracking-[0.18em] text-[#2f6b5b]">
            Your reset plan <span className="inline-flex h-4 w-4 items-center justify-center"><SparkIcon /></span>
          </div>
          <p className="mb-2 text-sm font-semibold text-[#61736e]">
            {styleName} style
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
            Your next steps, ready to check off.
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

      <article className="mb-5 grid items-center gap-6 rounded-[2rem] border border-[#dfe5dd] bg-gradient-to-br from-[#fffdf8] via-[#fffdf8] to-[#edf3ef] p-6 shadow-[0_20px_60px_rgba(34,68,58,0.08)] sm:grid-cols-[8rem_minmax(0,1fr)] sm:p-8">
        <div className="flex justify-center">
          <ScoreRing score={analysis.score} />
        </div>
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#61736e]">
            Your organization score
          </p>
          <p className="max-w-4xl text-lg font-semibold leading-8 sm:text-xl">
            {analysis.summary}
          </p>
          <p className="mt-3 text-sm text-[#61736e]">
            {analysis.tasks.length} focused tasks, ordered by impact.
          </p>
        </div>
      </article>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.4fr]">
        <div className="space-y-5">
          <article className="rounded-[2rem] border border-[#dfe5dd] bg-white/70 p-6">
            <h3 className="mb-4 font-bold">What we noticed</h3>
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
              <h3 className="mt-1 text-2xl font-bold">Check off your next steps</h3>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm">
              {completedCount}/{analysis.tasks.length} done
            </span>
          </div>
          <ol className="space-y-3">
            {analysis.tasks.map((task, index) => (
              <li key={`${task.title}-${index}`} className="group rounded-2xl bg-white/[0.07] transition hover:bg-white/[0.11]">
                <label className="flex cursor-pointer gap-4 p-4">
                  <input
                    type="checkbox"
                    checked={completedTasks[index] ?? false}
                    onChange={() => onToggleTask(index)}
                    className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer accent-[#f2b84b]"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className={`font-bold ${completedTasks[index] ? "text-[#a8c4b9] line-through" : ""}`}>{task.title}</h4>
                    <p className="mt-1.5 text-sm leading-6 text-[#c3d4cd]">{task.reason}</p>
                  </div>
                </label>
              </li>
            ))}
          </ol>
          {analysis.safetyNotes.length > 0 && (
            <div className="mt-5 rounded-2xl border border-[#f2b84b]/35 bg-[#f2b84b]/10 p-4">
              <p className="text-sm font-bold text-[#ffd980]">Caution</p>
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
              <h3 className="mt-1 text-2xl font-bold">A possible look for your desk</h3>
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
            alt="AI-generated organization concept for your desk"
            className="max-h-[640px] w-full rounded-2xl bg-[#edf3ef] object-contain"
          />
          <p className="mt-3 text-xs leading-5 text-[#71817c]">
            AI-generated preview for inspiration. Details may be inaccurate or differ from your actual space.
          </p>
        </article>
      ) : (
        <p className="mt-5 rounded-2xl border border-[#dfe5dd] bg-white/70 px-5 py-4 text-sm text-[#61736e]">
          We couldn&apos;t create a visual preview because the photo wasn&apos;t clearly identified as a desk.
        </p>
      )}
    </section>
  );
}

export function DeskAnalyzer() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<boolean[]>([]);
  const [styleId, setStyleId] = useState<StyleId>(styleDefinitions[0].id);
  const [resultStyleId, setResultStyleId] = useState<StyleId | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyProjects, setHistoryProjects] = useState<
    ReturnType<typeof projectHistoryResponseSchema.parse>["projects"]
  >([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<HistoryProject | null>(null);
  const [historyError, setHistoryError] = useState("");
  const [projectSaveNotice, setProjectSaveNotice] = useState("");

  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = window.setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, steps.length - 1));
    }, PROGRESS_STEP_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isAnalyzing]);

  useEffect(() => {
    if (!projectToDelete) return;

    cancelDeleteRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setProjectToDelete(null);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [projectToDelete]);

  useEffect(() => {
    if (!activeProjectId) return;

    const projectId = activeProjectId;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completedTasks }),
          signal: controller.signal,
        });
        const json: unknown = await response.json();
        if (!response.ok) {
          throw new Error(
            getResponseError(json, "We could not save checklist progress."),
          );
        }
      } catch (caught) {
        if (controller.signal.aborted) return;
        setProjectSaveNotice(
          caught instanceof Error
            ? `Checklist progress could not be saved: ${caught.message}`
            : "Checklist progress could not be saved. Please try again.",
        );
      }
    }, 400);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [activeProjectId, completedTasks]);

  async function acceptFile(file?: File) {
    if (!file) return;
    setError("");
    setResult(null);
    setActiveProjectId(null);
    setCompletedTasks([]);
    setResultStyleId(null);
    setProjectSaveNotice("");
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
    setActiveProjectId(null);
    setCompletedTasks([]);
    setError("");
    setProjectSaveNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleHistory() {
    if (isHistoryOpen) {
      setIsHistoryOpen(false);
      return;
    }

    setIsHistoryOpen(true);
    setHistoryError("");
    setIsHistoryLoading(true);
    try {
      const response = await fetch("/api/projects");
      const json: unknown = await response.json();
      if (!response.ok) {
        throw new Error(getResponseError(json, "Could not load project history."));
      }
      setHistoryProjects(projectHistoryResponseSchema.parse(json).projects);
    } catch (caught) {
      setHistoryError(
        caught instanceof Error
          ? caught.message
          : "We could not load project history. Please try again.",
      );
    } finally {
      setIsHistoryLoading(false);
    }
  }

  async function openHistoryProject(projectId: string) {
    setLoadingProjectId(projectId);
    setHistoryError("");
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const json: unknown = await response.json();
      if (!response.ok) {
        throw new Error(getResponseError(json, "Could not open this project."));
      }
      const project = savedProjectResponseSchema.parse(json).project;
      setResult(project.result);
      setActiveProjectId(project.id);
      setCompletedTasks(project.completedTasks);
      setResultStyleId(
        styleDefinitions.find((style) => style.id === project.styleId)?.id ?? null,
      );
      setProjectSaveNotice("");
      setIsHistoryOpen(false);
      window.setTimeout(
        () => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (caught) {
      setHistoryError(
        caught instanceof Error
          ? caught.message
          : "We could not open this project. Please try again.",
      );
    } finally {
      setLoadingProjectId(null);
    }
  }

  async function deleteHistoryProject(projectId: string) {
    setDeletingProjectId(projectId);
    setHistoryError("");
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      const json: unknown = await response.json();
      if (!response.ok) {
        throw new Error(getResponseError(json, "Could not delete this project."));
      }
      setHistoryProjects((current) =>
        current.filter((project) => project.id !== projectId),
      );
    } catch (caught) {
      setHistoryError(
        caught instanceof Error
          ? caught.message
          : "We could not delete this project. Please try again.",
      );
    } finally {
      setDeletingProjectId(null);
    }
  }

  async function confirmDeleteProject() {
    if (!projectToDelete) return;
    const projectId = projectToDelete.id;
    setProjectToDelete(null);
    await deleteHistoryProject(projectId);
  }

  async function analyze() {
    if (!image) return;
    const startedAt = Date.now();
    setError("");
    setProjectSaveNotice("");
    setActiveStep(0);
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
      const remainingProgressTime = MIN_PROGRESS_DURATION_MS - (Date.now() - startedAt);
      if (remainingProgressTime > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingProgressTime));
      }
      setResult(parsed);
      setActiveProjectId(null);
      const initialCompletedTasks = parsed.data.tasks.map(() => false);
      setCompletedTasks(initialCompletedTasks);
      setResultStyleId(styleId);
      try {
        const saveResponse = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ styleId, result: parsed }),
        });
        const saveJson: unknown = await saveResponse.json();
        if (!saveResponse.ok) {
          throw new Error(
            getResponseError(saveJson, "We could not save this project."),
          );
        }
        const saved = saveProjectResponseSchema.parse(saveJson).project;
        setActiveProjectId(saved.id);
        setProjectSaveNotice("This project was saved to your browser history.");
        setHistoryProjects((current) => [
          saved,
          ...current.filter((project) => project.id !== saved.id),
        ]);
      } catch (caught) {
        setProjectSaveNotice(
          caught instanceof Error
            ? `This result could not be saved to history: ${caught.message}`
            : "This result could not be saved to history.",
        );
      }
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

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-16 pt-8 sm:px-8 md:pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
        <div>
          <h1 className="max-w-xl text-5xl font-bold leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
            Find your next step toward a <span className="text-[#2f6b5b]">clearer desk.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#61736e]">
            Share a photo to get an encouraging organization score, a prioritized checklist, and a visual idea for your space.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#486159]">
            {styleDefinitions.map((style) => (
              <span key={style.id} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f2b84b]" />{style.name}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void toggleHistory()}
            aria-expanded={isHistoryOpen}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#cbd5cc] bg-white/75 px-5 py-2.5 text-sm font-bold text-[#18312b] shadow-sm transition hover:border-[#2f6b5b] hover:text-[#2f6b5b]"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none">
              <path d="M3 12a9 9 0 109-9 9.6 9.6 0 00-6.4 2.5L3 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 3v4h4m5-1v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isHistoryOpen ? "Hide history" : "View history"}
          </button>
          {isHistoryOpen && (
            <section className="mt-4 rounded-2xl border border-[#dfe5dd] bg-white/80 p-4 shadow-sm" aria-label="Saved desk projects">
              <h2 className="font-bold">Your saved projects</h2>
              {isHistoryLoading ? (
                <p className="mt-3 text-sm text-[#61736e]" role="status">Loading your history…</p>
              ) : historyError ? (
                <p className="mt-3 text-sm text-[#853e34]" role="alert">{historyError}</p>
              ) : historyProjects.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-[#61736e]">
                  No project yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {historyProjects.map((project) => (
                    <li
                      key={project.id}
                      className="rounded-xl border border-[#e7ebe5] bg-[#faf9f4] p-3"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => void openHistoryProject(project.id)}
                          disabled={loadingProjectId !== null || deletingProjectId !== null}
                          className="min-w-0 flex-1 text-left disabled:opacity-60"
                        >
                          <span className="flex items-center justify-between gap-3">
                            <span className="font-bold">{project.styleName} desk</span>
                            <span className="shrink-0 text-xs font-bold text-[#2f6b5b]">
                              Score {project.score}
                            </span>
                          </span>
                          <span className="mt-1 block text-sm leading-5 text-[#61736e]">
                            {project.summary}
                          </span>
                          <span className="mt-2 block text-xs text-[#71817c]">
                            {new Intl.DateTimeFormat(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(project.createdAt))}
                            {loadingProjectId === project.id ? " · Opening…" : ""}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProjectToDelete(project)}
                          disabled={loadingProjectId !== null || deletingProjectId !== null}
                          aria-label={
                            deletingProjectId === project.id
                              ? `Deleting ${project.styleName} desk project`
                              : `Delete ${project.styleName} desk project`
                          }
                          title="Delete project"
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e1aaa2] bg-white text-[#853e34] transition hover:bg-[#fff0ed] disabled:opacity-60"
                        >
                          {deletingProjectId === project.id ? (
                            <span aria-hidden="true" className="text-sm">…</span>
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              className="h-4 w-4"
                              fill="none"
                            >
                              <path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
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
          <div className="rounded-[2rem] border border-[#dfe5dd] bg-white/80 p-6 shadow-[0_20px_60px_rgba(34,68,58,0.08)] sm:p-8">
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-[#61736e]">
                <span>Building your reset plan</span>
                <span>Step {activeStep + 1} of {steps.length}</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-[#e7ebe5]"
                role="progressbar"
                aria-label="Analysis progress"
                aria-valuemin={1}
                aria-valuemax={steps.length}
                aria-valuenow={activeStep + 1}
              >
                <div
                  className="h-full rounded-full bg-[#2f6b5b] transition-[width] duration-500 ease-out"
                  style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <div
                  key={step}
                  aria-current={index === activeStep ? "step" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-2 py-2 transition-colors ${
                    index === activeStep
                      ? "bg-[#e6eee9] text-[#18312b]"
                      : index < activeStep
                        ? "text-[#2f6b5b]"
                        : "text-[#82918b]"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                      index === activeStep
                        ? "animate-pulse-soft bg-[#2f6b5b] text-white"
                        : index < activeStep
                          ? "bg-[#2f6b5b] text-white"
                          : "bg-[#e7ebe5] text-[#61736e]"
                    }`}
                  >
                    {index < activeStep ? "✓" : index + 1}
                  </span>
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
            projectSaveNotice={projectSaveNotice}
            completedTasks={completedTasks}
            onToggleTask={(index) =>
              setCompletedTasks((current) =>
                current.map((completed, taskIndex) =>
                  taskIndex === index ? !completed : completed,
                ),
              )
            }
            styleName={
              styleDefinitions.find((style) => style.id === resultStyleId)?.name ??
              "Selected"
            }
            onReset={reset}
          />
        )}
      </div>

      {projectToDelete && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#10231f]/55 p-5 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setProjectToDelete(null);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
            aria-describedby="delete-project-description"
            className="w-full max-w-md rounded-[2rem] border border-white/80 bg-[#fffdf8] p-6 shadow-[0_30px_90px_rgba(10,31,25,0.3)] sm:p-8"
          >
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0ed] text-[#a64439]">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
                <path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 id="delete-project-title" className="text-xl font-bold tracking-tight">
              Delete this saved project?
            </h2>
            <p id="delete-project-description" className="mt-2 text-sm leading-6 text-[#61736e]">
              This will permanently remove your {projectToDelete.styleName.toLowerCase()} desk project from history.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                ref={cancelDeleteRef}
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="rounded-full border border-[#cbd5cc] bg-white px-5 py-2.5 text-sm font-bold text-[#18312b] transition hover:border-[#2f6b5b]"
              >
                Keep project
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteProject()}
                className="rounded-full bg-[#a64439] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#853e34]"
              >
                Delete project
              </button>
            </div>
          </section>
        </div>
      )}

      <footer className="border-t border-[#dfe5dd] px-5 py-7 text-center text-xs text-[#71817c]">
        Uploaded photos are not saved to history. Completed plans and generated previews are stored in your Neon-backed browser history.
      </footer>
    </main>
  );
}
