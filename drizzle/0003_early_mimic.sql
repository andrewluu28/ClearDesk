CREATE TABLE "desk_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"browser_id" uuid NOT NULL,
	"style_id" uuid,
	"style_name" text NOT NULL,
	"summary" text NOT NULL,
	"score" integer NOT NULL,
	"result" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "desk_projects_browser_created_idx" ON "desk_projects" USING btree ("browser_id","created_at");