import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const ruleCategory = pgEnum("rule_category", [
  "safety",
  "trash",
  "clutter",
  "documents",
  "cables",
  "electronics",
  "storage",
  "ergonomics",
]);

export const organizationRules = pgTable("organization_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  styleId: uuid("style_id"),
  category: ruleCategory("category").notNull(),
  trigger: text("trigger").notNull(),
  recommendation: text("recommendation").notNull(),
  reason: text("reason").notNull(),
  priority: integer("priority").notNull().default(50),
  estimatedMinutes: integer("estimated_minutes").notNull().default(5),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type OrganizationRule = typeof organizationRules.$inferSelect;
