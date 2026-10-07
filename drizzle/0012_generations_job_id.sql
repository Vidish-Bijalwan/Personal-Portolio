-- Generate-first flow: link paid image generations to their pricing job.
-- The job is the system of record for the quoted server-side price; the
-- unlock order (created at "Download clean HD" click time) reads the
-- amount from the job — never from the client.
--> statement-breakpoint
ALTER TABLE "generations" ADD COLUMN "job_id" uuid;
--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_job_id_generation_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."generation_jobs"("id") ON DELETE set null ON UPDATE no action;
