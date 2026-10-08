-- Fast-gen program (CODER 1 / SPEED):
-- (b) instant trigger — generation_triggers wake-up records written by the
--     order-creation routes so the fulfillment worker can start on a fast
--     poll instead of waiting for the next 1-minute claim poll.
-- (c) speculative pre-generation — spec_hash / spec_expires_at on
--     generations let /api/free/generate convert a ready or in-flight
--     non-charging speculative row (tier='speculative') into a real
--     free-tier row on a hash match.
--> statement-breakpoint
ALTER TABLE "generations" ADD COLUMN "spec_hash" text;
--> statement-breakpoint
ALTER TABLE "generations" ADD COLUMN "spec_expires_at" timestamp with time zone;
--> statement-breakpoint
CREATE TABLE "generation_triggers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"generation_id" uuid NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation_triggers" ADD CONSTRAINT "generation_triggers_generation_id_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "generation_triggers_pending_idx" ON "generation_triggers" ("consumed_at", "created_at");
