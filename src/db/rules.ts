import { and, eq, isNull, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { organizationRules, type OrganizationRule } from "@/db/schema";

export const seedRules: OrganizationRule[] = [
  {
    id: "e521012c-6b27-4b77-8f71-a8ba928b8d43",
    styleId: null,
    category: "safety",
    trigger: "Liquids are close to electronics or power connections.",
    recommendation: "Create a separate drink zone away from electronics.",
    reason: "This reduces spill, equipment, and electrical risk.",
    priority: 100,
    estimatedMinutes: 1,
    active: true,
    createdAt: new Date(0),
  },
  {
    id: "72a04e88-1e2c-45d8-9c23-f7ff58623da9",
    styleId: null,
    category: "clutter",
    trigger: "The primary working surface is blocked by loose objects.",
    recommendation: "Clear the center of the desk before organizing the edges.",
    reason: "An open work zone gives an immediate functional improvement.",
    priority: 90,
    estimatedMinutes: 5,
    active: true,
    createdAt: new Date(0),
  },
  {
    id: "99cc06b9-9b8f-4bdb-b4ce-55dc4124b399",
    styleId: null,
    category: "cables",
    trigger: "Loose or crossing cables occupy the desk or floor.",
    recommendation: "Route cables together and anchor them behind the desk.",
    reason: "Grouped cables are easier to clean around and less likely to snag.",
    priority: 75,
    estimatedMinutes: 8,
    active: true,
    createdAt: new Date(0),
  },
  {
    id: "22776dc6-eedb-46de-88d4-a3cba0bb20ec",
    styleId: null,
    category: "documents",
    trigger: "Loose papers or notebooks are spread across the work surface.",
    recommendation: "Sort paper into act, file, and recycle groups.",
    reason: "A three-way sort prevents paper piles from returning immediately.",
    priority: 65,
    estimatedMinutes: 10,
    active: true,
    createdAt: new Date(0),
  },
  {
    id: "a532b4f5-b3fa-4d2f-a0d7-1ad7c1afe14b",
    styleId: null,
    category: "ergonomics",
    trigger: "The screen or frequently used tools require awkward reach.",
    recommendation: "Center the screen and keep daily tools within easy reach.",
    reason: "A neutral working position reduces repeated strain.",
    priority: 70,
    estimatedMinutes: 4,
    active: true,
    createdAt: new Date(0),
  },
];

export async function getActiveRules(
  styleId: string | null,
): Promise<OrganizationRule[]> {
  if (!process.env.DATABASE_URL) {
    return seedRules.filter(
      (rule) => rule.styleId === null || rule.styleId === styleId,
    );
  }

  const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
  try {
    const db = drizzle(client);
    const rules = await db
      .select()
      .from(organizationRules)
      .where(
        and(
          eq(organizationRules.active, true),
          styleId
            ? or(
                isNull(organizationRules.styleId),
                eq(organizationRules.styleId, styleId),
              )
            : isNull(organizationRules.styleId),
        ),
      );
    return rules.length > 0 ? rules : seedRules;
  } finally {
    await client.end();
  }
}
