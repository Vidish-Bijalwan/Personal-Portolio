--> statement-breakpoint
-- Distinct failure class for provider safety-filter refusals
-- (e.g. the image model declining a prompt containing 'fire' or
-- 'blood') vs ordinary technical failures. status stays 'failed';
-- error_code is advisory metadata only and never consumes quota.
ALTER TABLE "generations" ADD COLUMN "error_code" text;
