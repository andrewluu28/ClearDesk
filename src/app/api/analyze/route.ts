import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { ZodError } from "zod";

import { getActiveRules } from "@/db/rules";
import {
  analyzeRequestSchema,
  calculateOrganizationScore,
  modelAnalysisSchema,
} from "@/lib/analysis";

export const maxDuration = 60;

const MAX_REQUEST_BYTES = 10 * 1024 * 1024;

function demoAnalysis() {
  const analysis = {
    imageValid: true,
    summary:
      "Your desk has a useful foundation. Clearing the center and grouping loose items will create the quickest improvement.",
    observations: [
      {
        category: "clutter" as const,
        description: "Small objects are competing for the primary work surface.",
        severity: "high" as const,
      },
      {
        category: "cables" as const,
        description: "Visible cables could be grouped into a single route.",
        severity: "medium" as const,
      },
      {
        category: "documents" as const,
        description: "Loose paper does not yet have a clear next-action location.",
        severity: "low" as const,
      },
    ],
    tasks: [
      {
        title: "Clear the center zone",
        reason: "This immediately restores a usable work area.",
        priority: 1 as const,
        estimatedMinutes: 5,
        referenceRuleId: "72a04e88-1e2c-45d8-9c23-f7ff58623da9",
      },
      {
        title: "Group and route loose cables",
        reason: "A single cable path makes the setup safer and easier to clean.",
        priority: 2 as const,
        estimatedMinutes: 8,
        referenceRuleId: "99cc06b9-9b8f-4bdb-b4ce-55dc4124b399",
      },
      {
        title: "Sort visible paper",
        reason: "Use act, file, and recycle groups to prevent another pile.",
        priority: 3 as const,
        estimatedMinutes: 10,
        referenceRuleId: "22776dc6-eedb-46de-88d4-a3cba0bb20ec",
      },
    ],
    safetyNotes: [],
  };

  return {
    data: { ...analysis, score: calculateOrganizationScore(analysis) },
    mode: "demo" as const,
  };
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return Response.json(
      { error: "The prepared image is too large. Try a smaller photo." },
      { status: 413 },
    );
  }

  try {
    const payload = analyzeRequestSchema.parse(await request.json());

    if (process.env.DEMO_MODE === "true") {
      return Response.json(demoAnalysis());
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error:
            "Analysis is not configured yet. Add OPENAI_API_KEY or enable DEMO_MODE.",
        },
        { status: 503 },
      );
    }

    const rules = await getActiveRules();
    const ruleContext = rules.map(
      ({ id, category, trigger, recommendation, reason }) => ({
        id,
        category,
        trigger,
        recommendation,
        reason,
      }),
    );
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.parse({
      model: process.env.OPENAI_MODEL ?? "gpt-5.5",
      instructions:
        "You analyze desk photos and create practical organization plans. Use supplied reference rules when relevant. Prioritize safety, avoid guessing private facts, and state when the image is not a desk or is too unclear. Return 3-5 concise observations and no more than 7 actionable tasks. Priority 1 is most urgent.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyze this desk using these curated rules as reference:\n${JSON.stringify(ruleContext)}`,
            },
            {
              type: "input_image",
              image_url: payload.image,
              detail: "auto",
            },
          ],
        },
      ],
      text: {
        format: zodTextFormat(modelAnalysisSchema, "desk_analysis"),
      },
    });

    if (!response.output_parsed) {
      return Response.json(
        { error: "The analysis did not return a usable result. Please try again." },
        { status: 502 },
      );
    }

    return Response.json({
      data: {
        ...response.output_parsed,
        score: calculateOrganizationScore(response.output_parsed),
      },
      mode: "live" as const,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "The request is invalid." },
        { status: 400 },
      );
    }

    console.error("Desk analysis failed", error);
    return Response.json(
      { error: "We could not analyze the desk right now. Please try again." },
      { status: 500 },
    );
  }
}
