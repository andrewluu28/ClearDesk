import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { seedRules } from "../src/db/rules";
import { organizationRules } from "../src/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed organization rules.");
}

const client = postgres(databaseUrl, { max: 1, prepare: false });
const db = drizzle(client);

async function seedOrganizationRules() {
  try {
    await db.transaction(async (transaction) => {
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

    const [{ total }] = await db
      .select({ total: count() })
      .from(organizationRules);

    console.log(`Seeded ${seedRules.length} organization rules.`);
    console.log(`organization_rules now contains ${total} rows.`);
  } finally {
    await client.end();
  }
}

seedOrganizationRules().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Failed to seed organization rules.",
  );
  process.exitCode = 1;
});
