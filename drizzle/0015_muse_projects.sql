-- Madam Muse program (Phase 1, backend workstream):
-- projects persistence + pipeline wiring.
--
-- Extends the existing `projects` table with the CreativeBrief payload
-- (JSONB), reference tracking, a revision counter, and the last delivered
-- result; threads the brief / compiled prompt / project link through
-- generation_jobs (quote time) and the generations queue rows (queue time)
-- so the fulfillment worker sees the smarter prompt without any change to
-- the worker/fulfillment path itself.
--
-- Note: `projects.title` is renamed to `name` per the Madam Muse contract
-- (§2 Project shape). No code references `title` — only the schema
-- definition — so the rename is safe.
--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "title" TO "name";
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "brief" jsonb;
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "primary_asset" jsonb;
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "reference_ids" jsonb;
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "revisions" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "last_result" jsonb;
--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "brief" jsonb;
--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "compiled_prompt" text;
--> statement-breakpoint
ALTER TABLE "generations" ADD COLUMN "brief" jsonb;
--> statement-breakpoint
ALTER TABLE "generations" ADD COLUMN "project_id" uuid;
--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
