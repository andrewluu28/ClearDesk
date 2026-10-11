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
    description:
      "Use the fewest purposeful elements, colors, and materials so attention stays on what matters most.",
    promptGuidance:
      "Apply minimalism through intentional selection, not indiscriminate removal. Preserve every useful work object, especially the user's existing notebook, journal, planner, or study notes. Make the desk feel tidy by aligning, spacing, grouping, and consolidating distracting loose items. Maintain generous negative space, a restrained palette, and only add an object when it has a clear organizing function that the existing desk cannot provide.",
    visualProfile: {
      keywords: [
        "purposeful",
        "focused",
        "tidy",
        "restrained",
        "quiet",
        "generous negative space",
      ],
      requiredSignals: [
        "large areas of open work surface",
        "only purposeful task-relevant objects remain visible",
        "existing notebook or work materials are preserved and neatly aligned",
        "small loose items are grouped or consolidated rather than erased",
        "cohesive neutral colors",
      ],
      conflictingSignals: [
        "scattered small objects",
        "duplicate containers",
        "misaligned loose paper that is not part of a notebook or active work",
        "decorative objects without a clear function",
        "visible cable tangles",
      ],
      preferredObjects: [
        "slim neutral desk mat",
        "small lidded storage box",
        "minimal catchall tray",
      ],
      palette: ["warm white", "pale gray", "natural wood", "matte black"],
      materials: ["felt", "light wood", "matte metal", "stoneware"],
      maxNewItems: 1,
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
    description:
      "Maximize meaningful output while reducing the time, energy, and resources spent reaching it.",
    promptGuidance:
      "Make the desk look ready for focused work, with one obvious primary work axis and minimal friction between intention and action. Straighten the setup so the screen, keyboard, notebook, and desk edges feel deliberately aligned. Create distinct zones for active work, reference material, quick-access tools, and cable infrastructure. Preserve useful equipment, remove visual competition by grouping loose supplies, and add only high-signal functional tools that address a visible missing need.",
    visualProfile: {
      keywords: [
        "ready-to-work",
        "focused",
        "low-friction",
        "zoned",
        "ergonomic",
        "aligned",
        "deliberate",
      ],
      requiredSignals: [
        "one clear central work axis with the primary screen and input devices aligned",
        "straight object edges that run parallel or perpendicular to the desk edge",
        "one obvious active-work zone with a single next-action surface",
        "frequently used tools within reach and occasional supplies moved outward",
        "reference material supported without blocking the work surface",
        "one controlled cable route behind or beside the primary equipment",
      ],
      conflictingSignals: [
        "multiple competing work areas",
        "crooked or randomly oriented equipment",
        "decorative or novelty objects inside the active work zone",
        "duplicate organizers",
        "blocked primary work area",
        "loose visible cables",
        "scattered pens and supplies",
        "rarely used supplies occupying the immediate reach zone",
      ],
      preferredObjects: [
        "supportive laptop or monitor riser",
        "single action notebook with one pen",
        "compact analog focus timer",
        "angled document stand",
        "cable management dock",
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
