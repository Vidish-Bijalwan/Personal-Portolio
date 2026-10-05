CREATE TABLE "generation_attachments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"generation_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"data" bytea NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation_attachments" ADD CONSTRAINT "generation_attachments_generation_id_generation_jobs_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generation_jobs"("id") ON DELETE cascade ON UPDATE no action;
