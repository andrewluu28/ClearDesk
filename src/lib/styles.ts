export const styleDefinitions = [
  {
    id: "ca0aa782-fdcb-448a-80c2-b29f0f730995",
    slug: "minimalist",
    name: "Minimalist",
    description: "Clear surfaces, few visible objects, and neutral organization.",
    promptGuidance:
      "Create an unmistakably minimalist result. Remove or conceal 80-90% of movable nonessential objects. Keep only the primary computer equipment and at most one notebook and one pen. Consolidate papers into one closed or nearly invisible storage location. Hide cables and remove duplicate cups, trays, binders, decorations, and the drink from the main work surface. Leave a large uninterrupted empty work area. Use a restrained neutral palette and clean, crisp lighting. The result must look substantially sparse, not merely tidier.",
  },
  {
    id: "b01ddbf3-61ab-4796-8eff-05bae2767507",
    slug: "cozy",
    name: "Cozy",
    description: "Warm, personal, and comfortable organization.",
    promptGuidance:
      "Create an unmistakably cozy and personal workspace while retaining a clear central work area. Use warm amber lighting, soft shadows, natural wood and fabric textures, and an inviting asymmetrical arrangement. Keep or introduce only three to five physically plausible comfort elements, such as one small plant, one framed print, one warm desk lamp, and a mug positioned safely away from electronics. Allow a few curated personal objects to remain visible. Avoid a sparse, clinical, or corporate appearance.",
  },
  {
    id: "0f52a223-f568-4299-af20-7edeea3dbec7",
    slug: "productivity",
    name: "Productivity",
    description: "Ergonomic, efficient, and work-focused organization.",
    promptGuidance:
      "Create an unmistakably productivity-focused workstation. Center and align the primary computer setup, establish separate computer, writing, and document zones, place one action notebook beside the computer, consolidate daily tools into one organizer, place documents in one inbox tray, and route all cables behind the desk. Remove decorative objects, duplicate containers, and rarely used items from view. Use bright neutral task lighting and strong visual order. The result should look ready for focused work, not cozy or decorative.",
  },
] as const;

export type StyleId = (typeof styleDefinitions)[number]["id"];

export function findStyleDefinition(styleId: string | null) {
  if (!styleId) return null;
  return styleDefinitions.find((style) => style.id === styleId) ?? null;
}
