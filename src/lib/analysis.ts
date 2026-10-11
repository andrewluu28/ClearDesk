import { z } from "zod";

import { findStyleDefinition } from "@/lib/styles";

export const categorySchema = z.enum([
  "safety",
  "trash",
  "clutter",
  "documents",
  "cables",
  "electronics",
  "storage",
  "ergonomics",
]);

export const modelAnalysisSchema = z.object({
  imageValid: z.boolean(),
  summary: z.string(),
  environment: z.object({
    fixedItems: z.array(z.string()),
    essentialItems: z.array(z.string()),
    movableItems: z.array(z.string()),
    personalItems: z.array(z.string()),
    availableZones: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
      }),
    ),
    dominantColors: z.array(z.string()),
    lighting: z.string(),
  }),
  styleAudit: z.object({
    matchedSignals: z.array(z.string()),
    missingSignals: z.array(z.string()),
    conflictingSignals: z.array(z.string()),
  }),
  editPlan: z.object({
    keep: z.array(z.string()),
    relocate: z.array(
      z.object({
        item: z.string(),
        destination: z.string(),
      }),
    ),
    conceal: z.array(z.string()),
    additions: z
      .array(
        z.object({
          item: z.string(),
          placement: z.string(),
          missingSignal: z.string(),
          reason: z.string(),
        }),
      )
      .max(3),
  }),
  observations: z.array(
    z.object({
      category: categorySchema,
      description: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),
  tasks: z.array(
    z.object({
      title: z.string(),
      reason: z.string(),
      priority: z.number().int().min(1).max(3),
      referenceRuleId: z.string().nullable(),
    }),
  ),
  safetyNotes: z.array(z.string().max(100)).max(2),
});

export const deskAnalysisSchema = modelAnalysisSchema.extend({
  score: z.number().int().min(0).max(100),
});

export const analyzeRequestSchema = z.object({
  image: z
    .string()
    .max(9_000_000)
    .regex(
      /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/,
      "Use a Base64 JPEG, PNG, WebP, or GIF image.",
    ),
  styleId: z
    .string()
    .uuid()
    .nullable()
    .default(null)
    .refine(
      (styleId) => styleId === null || findStyleDefinition(styleId) !== null,
      "Choose one of the available organization styles.",
    ),
});

export const analyzeResponseSchema = z.object({
  data: deskAnalysisSchema,
  resultImage: z
    .string()
    .regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/)
    .nullable(),
  mode: z.enum(["live", "demo"]),
});

export type DeskAnalysis = z.infer<typeof deskAnalysisSchema>;
export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;

export function calculateOrganizationScore(
  analysis: z.infer<typeof modelAnalysisSchema>,
) {
  if (!analysis.imageValid) return 0;

  // Keep the score encouraging: findings should identify opportunities without
  // making a usable desk feel like a failure.
  const severityPenalty = { low: 2, medium: 5, high: 9 } as const;
  const observationPenalty = analysis.observations.reduce(
    (total, observation) => total + severityPenalty[observation.severity],
    0,
  );
  const safetyPenalty = Math.min(12, analysis.safetyNotes.length * 6);

  return Math.max(20, Math.min(100, 100 - observationPenalty - safetyPenalty));
}
