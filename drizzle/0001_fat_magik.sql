CREATE TABLE "organization_styles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"prompt_guidance" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_styles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "organization_rules" ADD CONSTRAINT "organization_rules_style_id_organization_styles_id_fk" FOREIGN KEY ("style_id") REFERENCES "public"."organization_styles"("id") ON DELETE set null ON UPDATE no action;