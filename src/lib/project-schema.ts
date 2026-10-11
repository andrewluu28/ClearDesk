import { z } from "zod";

import { analyzeResponseSchema } from "@/lib/analysis";
import { findStyleDefinition } from "@/lib/styles";

export const savedProjectSummarySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  styleName: z.string(),
  summary: z.string(),
  score: z.number().int().min(0).max(100),
});

export const projectHistoryResponseSchema = z.object({
  projects: z.array(savedProjectSummarySchema),
});

export const savedProjectSchema = savedProjectSummarySchema.extend({
  styleId: z.string().uuid().nullable(),
  result: analyzeResponseSchema,
  completedTasks: z.array(z.boolean()).max(7),
});

export const savedProjectResponseSchema = z.object({
  project: savedProjectSchema,
});

export const saveProjectResponseSchema = z.object({
  project: savedProjectSummarySchema,
});

export { findStyleDefinition };
