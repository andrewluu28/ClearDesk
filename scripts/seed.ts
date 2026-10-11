import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { seedRules } from "../src/db/rules";
import { organizationRules, organizationStyles } from "../src/db/schema";
import { seedStyles } from "../src/db/styles";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const client = postgres(databaseUrl, { max: 1, prepare: false });
const db = drizzle(client);

async function seedDatabase() {
  try {
    await db.transaction(async (transaction) => {
      for (const style of seedStyles) {
        await transaction
          .insert(organizationStyles)
          .values({ ...style, createdAt: new Date() })
          .onConflictDoUpdate({
            target: organizationStyles.id,
            set: {
              slug: style.slug,
              name: style.name,
              description: style.description,
              promptGuidance: style.promptGuidance,
              visualProfile: style.visualProfile,
              active: style.active,
            },
          });
      }

      for (const rule of seedRules) {
        await transaction
          .insert(organizationRules)
          .values({ ...rule, createdAt: new Date() })
          .onConflictDoUpdate({
            target: organizationRules.id,
            set: {
              styleId: rule.styleId,
              category: rule.category,
              trigger: rule.trigger,
              recommendation: rule.recommendation,
              reason: rule.reason,
              priority: rule.priority,
              estimatedMinutes: rule.estimatedMinutes,
              active: rule.active,
            },
          });
      }
    });

    const [{ total: styleTotal }] = await db
      .select({ total: count() })
      .from(organizationStyles);
    const [{ total: ruleTotal }] = await db
      .select({ total: count() })
      .from(organizationRules);

    console.log(`Seeded ${seedStyles.length} organization styles.`);
    console.log(`organization_styles now contains ${styleTotal} rows.`);
    console.log(`Seeded ${seedRules.length} organization rules.`);
    console.log(`organization_rules now contains ${ruleTotal} rows.`);
  } finally {
    await client.end();
  }
}

seedDatabase().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Failed to seed the database.",
  );
  process.exitCode = 1;
});
