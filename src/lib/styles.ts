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
