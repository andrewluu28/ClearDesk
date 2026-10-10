import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { organizationStyles, type OrganizationStyle } from "@/db/schema";
import { styleDefinitions } from "@/lib/styles";

export const seedStyles: OrganizationStyle[] = styleDefinitions.map((style) => ({
  ...style,
  active: true,
  createdAt: new Date(0),
}));

export async function getActiveStyle(
  styleId: string | null,
): Promise<OrganizationStyle | null> {
  if (!styleId) return null;

  if (!process.env.DATABASE_URL) {
    return seedStyles.find((style) => style.id === styleId) ?? null;
  }

  const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
  try {
    const db = drizzle(client);
    const [style] = await db
      .select()
      .from(organizationStyles)
      .where(
        and(
          eq(organizationStyles.id, styleId),
          eq(organizationStyles.active, true),
        ),
      )
      .limit(1);
    return style ?? null;
  } finally {
    await client.end();
  }
}
