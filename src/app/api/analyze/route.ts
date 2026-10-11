import { readFile } from "node:fs/promises";
import { join } from "node:path";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { toFile } from "openai/uploads";
import { ZodError } from "zod";

import { getActiveRules } from "@/db/rules";
import { getActiveStyle } from "@/db/styles";
import {
  analyzeRequestSchema,
  calculateOrganizationScore,
  modelAnalysisSchema,
} from "@/lib/analysis";

export const maxDuration = 60;

const MAX_REQUEST_BYTES = 10 * 1024 * 1024;
const PROTECTED_WORK_ITEM_PATTERN =
  /notebook|journal|planner|sketchbook|workbook|study notes|written notes/i;

async function demoAnalysis() {
  const analysis = {
    imageValid: true,
    summary:
      "Your desk has a useful foundation. Clearing the center and grouping loose items will create the quickest improvement.",
    environment: {
      fixedItems: ["desk", "monitor"],
      essentialItems: ["keyboard", "mouse"],
      movableItems: ["loose papers", "small supplies"],
      personalItems: [],
      availableZones: [
        {
          name: "rear corner",
          description: "A small open area suitable for one compact accent.",
        },
      ],
      dominantColors: ["natural wood", "black", "white"],
      lighting: "Soft ambient room lighting",
    },
    styleAudit: {
      matchedSignals: ["natural wood surface"],
      missingSignals: ["a more intentional visual grouping"],
      conflictingSignals: ["scattered small objects"],
    },
    editPlan: {
      keep: ["desk", "monitor", "keyboard", "mouse"],
      relocate: [
        { item: "small supplies", destination: "one existing container" },
      ],
      conceal: ["loose papers"],
      additions: [],
    },
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
  const sampleImage = await readFile(
    join(process.cwd(), "Images", "organized-desk.jpg"),
  );

  return {
    data: { ...analysis, score: calculateOrganizationScore(analysis) },
    resultImage: `data:image/jpeg;base64,${sampleImage.toString("base64")}`,
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
      return Response.json(await demoAnalysis());
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

    const [selectedStyle, rules] = await Promise.all([
      getActiveStyle(payload.styleId),
      getActiveRules(payload.styleId),
    ]);
    if (payload.styleId && !selectedStyle) {
      return Response.json(
        { error: "That organization style is unavailable." },
        { status: 400 },
      );
    }

    const ruleContext = rules.map(
      ({ id, category, trigger, recommendation, reason }) => ({
        id,
        category,
        trigger,
        recommendation,
        reason,
      }),
    );
    const styleContext = selectedStyle
      ? {
          name: selectedStyle.name,
          description: selectedStyle.description,
          guidance: selectedStyle.promptGuidance,
          visualProfile: selectedStyle.visualProfile,
        }
      : null;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.parse({
      model: process.env.OPENAI_MODEL ?? "gpt-5.5",
      instructions:
        "You analyze desk photos and create practical organization plans plus a tightly constrained visual-decoration edit plan. First inventory what is visibly present and identify open placement zones. Then compare only visible evidence with the selected style's required and conflicting signals. Preserve fixed furniture, architecture, electronics, personal identity, and useful objects. Treat every notebook, journal, planner, sketchbook, workbook, and set of study notes as a protected useful work object: include it in essentialItems and keep, never conceal or discard it, though you may neatly align or relocate it. For Minimalist, express simplicity through intentional spacing, alignment, grouping, and consolidation rather than making useful possessions disappear; default to zero additions and add at most one approved functional organizer only when necessary. For Productivity, optimize for meaningful output per unit of time, energy, and resources: create one central work axis, square movable work objects with the desk edges, group loose supplies, move distractions outside the immediate reach zone, and choose additions from visualProfile.preferredObjects in listed priority order. Add a riser only when it can improve an existing screen or laptop position; add an action notebook only when no equivalent notebook is visible; add a focus timer only when it fits a free quick-access zone; add a document stand only when visible reference papers need support; add cable management only when loose cables are visible. Each Productivity addition must address a different observed friction and occupy a different zone. For additions, choose only exact item names from visualProfile.preferredObjects, never add an item or equivalent that is already visible, use zero additions when none are needed, never exceed visualProfile.maxNewItems, and place every addition in a visibly available zone. The edit should strengthen the selected vibe without replacing the user's real desk. Use supplied reference rules when relevant. Prioritize safety, avoid guessing private facts, and state when the image is not a desk or is too unclear. Return 3-5 concise observations and no more than 7 actionable tasks. Priority 1 is most urgent.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                `Selected organization style:\n${JSON.stringify(styleContext)}`,
                `Curated organization rules:\n${JSON.stringify(ruleContext)}`,
                "Scan the current environment before recommending changes. Record fixed, essential, movable, and personal items; open placement zones; dominant colors; and lighting. Identify which style signals already match, which are missing, and which visible details conflict. Build an edit plan that keeps matching elements, tidies or relocates distracting objects, and conceals only genuinely loose low-value clutter that can realistically go into existing storage. Never classify a notebook or active work material as disposable clutter. Add approved objects only when they supply a genuinely missing style signal. For Productivity, explicitly identify the primary work axis, active-work zone, reference zone, quick-access zone, and cable route when they are visible or can be created from existing space. Recommend practical tips while respecting safety and the user's existing equipment.",
              ].join("\n\n"),
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

    let resultImage: string | null = null;
    if (response.output_parsed.imageValid) {
      const profile = selectedStyle?.visualProfile;
      const allExistingItems = [
        ...response.output_parsed.environment.fixedItems,
        ...response.output_parsed.environment.essentialItems,
        ...response.output_parsed.environment.movableItems,
        ...response.output_parsed.environment.personalItems,
      ];
      const protectedItems = Array.from(
        new Set([
          ...response.output_parsed.environment.fixedItems,
          ...response.output_parsed.environment.essentialItems,
          ...response.output_parsed.environment.personalItems,
          ...allExistingItems.filter((item) =>
            PROTECTED_WORK_ITEM_PATTERN.test(item),
          ),
        ]),
      );
      const conceal = response.output_parsed.editPlan.conceal.filter(
        (item) => !PROTECTED_WORK_ITEM_PATTERN.test(item),
      );
      const allowedObjects = new Set(
        (profile?.preferredObjects ?? []).map((item) => item.toLowerCase()),
      );
      const additions = response.output_parsed.editPlan.additions
        .filter(
          ({ item }) => !profile || allowedObjects.has(item.toLowerCase()),
        )
        .slice(0, profile?.maxNewItems ?? 2);
      const imageBase64 = payload.image.slice(payload.image.indexOf(",") + 1);
      const imageFile = await toFile(
        Buffer.from(imageBase64, "base64"),
        "desk.jpg",
        { type: "image/jpeg" },
      );
      let generated;
      try {
        generated = await openai.images.edit({
          model:
            process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2.5-sunburst",
          image: imageFile,
          prompt: [
            "Create a photorealistic decoration suggestion for this exact real desk.",
            "This is a restrained image edit, not a redesigned room and not a generic staged desk.",
            "Preserve the same desk, shelves, walls, room architecture, electronics, camera angle, crop, perspective, image proportions, and direction of light.",
            "Preserve the identity, shape, color, scale, and position of all fixed items and every item listed under KEEP unless a relocation is explicitly listed.",
            `PROTECTED EXISTING OBJECTS — do not erase, replace, hide, or redesign these: ${protectedItems.join("; ") || "all useful work objects"}.`,
            "Any visible notebook, journal, planner, sketchbook, workbook, or study notes must remain visibly present and recognizably the same object. Preserve its cover, binding, page shape, scale, and existing writing. It may only be squared with the desk edge or moved to a tidier visible position.",
            selectedStyle
              ? `Target vibe: ${selectedStyle.name}. ${selectedStyle.promptGuidance}`
              : "Use a balanced, practical organization style.",
            profile
              ? `Vibe keywords: ${profile.keywords.join(", ")}. Palette: ${profile.palette.join(", ")}. Materials: ${profile.materials.join(", ")}.`
              : "Keep the materials and palette coherent with the existing desk.",
            `Already-matching signals to preserve: ${response.output_parsed.styleAudit.matchedSignals.join("; ") || "none identified"}.`,
            `KEEP: ${response.output_parsed.editPlan.keep.join("; ") || "all existing fixed and useful items"}.`,
            `RELOCATE ONLY: ${response.output_parsed.editPlan.relocate.map(({ item, destination }) => `${item} to ${destination}`).join("; ") || "nothing"}.`,
            `CONSOLIDATE INTO EXISTING STORAGE ONLY: ${conceal.join("; ") || "nothing"}. Do not make these objects vanish; place them plausibly inside an existing visible container or drawer.`,
            additions.length > 0
              ? `ADD ONLY THESE ${additions.length} APPROVED ITEMS: ${additions.map(({ item, placement, missingSignal }) => `${item} at ${placement} to provide ${missingSignal}`).join("; ")}.`
              : "ADD NO NEW OBJECTS.",
            "Do not introduce any object not explicitly listed under ADD ONLY. Do not duplicate existing objects. Do not replace furniture or electronics. Never erase personal or protected work objects.",
            selectedStyle?.slug === "minimalist"
              ? "MINIMALIST CHANGE RULE: change only visual disorder. Keep all useful possessions. Create focus through clean alignment, deliberate spacing, one clear work zone, grouped small supplies, controlled cables, and open surface area. Fewer visible elements must come from organizing existing items, never from deleting the user's notebook or other meaningful work materials."
              : selectedStyle?.slug === "productivity"
                ? "PRODUCTIVITY CHANGE RULE: make the setup look immediately ready for meaningful work. Establish one straight visual axis from the user's seated position through the keyboard or notebook to the primary screen. Square movable work objects with the front and side desk edges; do not rotate the desk, camera, furniture, or fixed electronics. Keep the central active-work zone open, place one next-action notebook and pen within reach when approved, keep reference material upright or angled to one side, place a compact analog focus timer in a separate quick-access corner when approved, and route loose cables toward one rear or side exit. Use at most one object per function and avoid decorative styling that does not improve workflow."
                : "Keep every unlisted object unchanged.",
            "Every added or moved object must fit the available space with realistic scale, contact, shadows, reflections, and occlusion. Keep natural photographic texture and minor real-world imperfections; avoid a glossy catalog-render look.",
            "Do not add labels, captions, logos, watermarks, or newly invented readable text. Preserve existing readable documents without rewriting their content.",
          ].join("\n"),
          quality: "medium",
          size: "1024x1024",
          output_format: "jpeg",
          output_compression: 80,
        });
      } catch (error) {
        console.error("Desk decoration image generation failed", error);
        return Response.json(
          { error: "The plan is ready, but the decoration suggestion could not be generated. Please try again." },
          { status: 502 },
        );
      }
      const generatedImage = generated.data?.[0]?.b64_json;
      if (!generatedImage) {
        return Response.json(
          { error: "The plan is ready, but we could not generate its decoration suggestion. Please try again." },
          { status: 502 },
        );
      }
      resultImage = `data:image/jpeg;base64,${generatedImage}`;
    }

    return Response.json({
      data: {
        ...response.output_parsed,
        score: calculateOrganizationScore(response.output_parsed),
      },
      resultImage,
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
