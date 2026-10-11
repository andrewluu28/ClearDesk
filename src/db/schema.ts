import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { AnalyzeResponse } from "@/lib/analysis";
import type { StyleVisualProfile } from "@/lib/style-profile";

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
  visualProfile: jsonb("visual_profile").$type<StyleVisualProfile>().notNull(),
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

export const deskProjects = pgTable(
  "desk_projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    browserId: uuid("browser_id").notNull(),
    styleId: uuid("style_id"),
    styleName: text("style_name").notNull(),
    summary: text("summary").notNull(),
    score: integer("score").notNull(),
    result: jsonb("result").$type<AnalyzeResponse>().notNull(),
    completedTasks: jsonb("completed_tasks").$type<boolean[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("desk_projects_browser_created_idx").on(
      table.browserId,
      table.createdAt,
    ),
  ],
);

export type OrganizationStyle = typeof organizationStyles.$inferSelect;
export type OrganizationRule = typeof organizationRules.$inferSelect;
export type DeskProject = typeof deskProjects.$inferSelect;
