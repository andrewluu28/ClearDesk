import { z } from "zod";

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
      estimatedMinutes: z.number().int().min(1).max(120),
      referenceRuleId: z.string().nullable(),
    }),
  ),
  safetyNotes: z.array(z.string()),
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
  styleId: z.string().uuid().nullable().default(null),
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

  const severityPenalty = { low: 4, medium: 9, high: 16 } as const;
  const observationPenalty = analysis.observations.reduce(
    (total, observation) => total + severityPenalty[observation.severity],
    0,
  );
  const safetyPenalty = Math.min(24, analysis.safetyNotes.length * 12);

  return Math.max(5, Math.min(100, 100 - observationPenalty - safetyPenalty));
}
