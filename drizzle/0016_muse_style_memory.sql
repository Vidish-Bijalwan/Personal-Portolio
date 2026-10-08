-- Madam Muse program (Phase 2, style memory):
-- approved-style fingerprints per user.
--
-- One row per approved style: a small structured StyleFingerprint JSON
-- (visual family, palette, texture, typography hints — see
-- src/lib/muse/style-memory.ts), never a blob. The prompt compiler
-- consults the memory as DEFAULTS only (family default + palette defaults
-- when the brief carries none); explicit instruction and the canonical
-- playbooks always win. Rows are user-scoped (cascade on user delete) and
-- trimmed to the last 20 per user by the service layer.
--> statement-breakpoint
CREATE TABLE "muse_style_memory" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text,
	"fingerprint" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "muse_style_memory" ADD CONSTRAINT "muse_style_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
