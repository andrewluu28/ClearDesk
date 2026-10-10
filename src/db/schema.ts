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

export const organizationStyles = pgTable("organization_styles", {
  id: uuid("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  promptGuidance: text("prompt_guidance").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const organizationRules = pgTable("organization_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  styleId: uuid("style_id").references(() => organizationStyles.id, {
    onDelete: "set null",
  }),
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

export type OrganizationStyle = typeof organizationStyles.$inferSelect;
export type OrganizationRule = typeof organizationRules.$inferSelect;
