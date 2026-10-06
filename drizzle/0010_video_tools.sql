-- Video Studio tool expansion (Phase 4): second input slot.
-- Tools like add-audio need TWO uploads (source video + audio track).
-- The watcher fetches input2 via GET /api/admin/video-jobs/[id]/input?which=2.
--> statement-breakpoint
ALTER TABLE "video_jobs" ADD COLUMN "input2" bytea;
--> statement-breakpoint
ALTER TABLE "video_jobs" ADD COLUMN "input2_mime" text;
