-- Payment claim flow: the user taps "I've paid" instead of submitting a UTR.
-- owner_pinged_at / ping_count drive the phone-ping throttle (ping at most
-- every 4 minutes, max 5 pings per order). short_code is the 4-char human
-- code shown in the owner's ping message (reply YES <code> / NO <code>).
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "owner_pinged_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "ping_count" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "short_code" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "orders_short_code_unique" ON "orders" ("short_code");
