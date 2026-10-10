export const styleDefinitions = [
  {
    id: "ca0aa782-fdcb-448a-80c2-b29f0f730995",
    slug: "minimalist",
    name: "Minimalist",
    description: "Clear surfaces, few visible objects, and neutral organization.",
    promptGuidance:
      "Favor clear surfaces, concealed storage, simple groupings, and only essential objects in view. Keep the result neutral, calm, and uncluttered.",
  },
  {
    id: "b01ddbf3-61ab-4796-8eff-05bae2767507",
    slug: "cozy",
    name: "Cozy",
    description: "Warm, personal, and comfortable organization.",
    promptGuidance:
      "Create a warm and comfortable workspace. Keep a small number of meaningful personal items visible, use inviting groupings, and preserve the desk's existing character.",
  },
  {
    id: "0f52a223-f568-4299-af20-7edeea3dbec7",
    slug: "productivity",
    name: "Productivity",
    description: "Ergonomic, efficient, and work-focused organization.",
    promptGuidance:
      "Prioritize ergonomics and efficient access. Center the primary work setup, keep daily tools within easy reach, route cables cleanly, and reduce visual distractions.",
  },
] as const;

export type StyleId = (typeof styleDefinitions)[number]["id"];

export function findStyleDefinition(styleId: string | null) {
  if (!styleId) return null;
  return styleDefinitions.find((style) => style.id === styleId) ?? null;
}
