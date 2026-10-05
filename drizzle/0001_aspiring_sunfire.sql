CREATE TABLE "fulfillment_results" (
	"id" uuid PRIMARY KEY NOT NULL,
	"job_id" uuid NOT NULL,
	"take_label" text DEFAULT 'Take 01' NOT NULL,
	"asset_id" uuid,
	"result_type" text NOT NULL,
	"notes" text,
	"tool_used" text,
	"duration_seconds" integer,
	"width" integer,
	"height" integer,
	"est_cost_paise" integer,
	"generation_time_seconds" integer,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "fulfillment_mode" text DEFAULT 'operator' NOT NULL;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "fulfillment_source" text;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "job_kind" text DEFAULT 'generation' NOT NULL;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "operator_notes" text;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "clarification_request" text;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "clarification_response" text;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "qc_notes" text;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "delivered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fulfillment_results" ADD CONSTRAINT "fulfillment_results_job_id_generation_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."generation_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fulfillment_results" ADD CONSTRAINT "fulfillment_results_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;