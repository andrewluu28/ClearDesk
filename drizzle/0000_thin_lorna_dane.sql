CREATE TYPE "public"."rule_category" AS ENUM('safety', 'trash', 'clutter', 'documents', 'cables', 'electronics', 'storage', 'ergonomics');--> statement-breakpoint
CREATE TABLE "organization_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"style_id" uuid,
	"category" "rule_category" NOT NULL,
	"trigger" text NOT NULL,
	"recommendation" text NOT NULL,
	"reason" text NOT NULL,
	"priority" integer DEFAULT 50 NOT NULL,
	"estimated_minutes" integer DEFAULT 5 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
