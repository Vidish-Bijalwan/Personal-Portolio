CREATE TABLE IF NOT EXISTS "video_jobs" (
  "id" uuid PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "tool" text NOT NULL,
  "status" text DEFAULT 'queued' NOT NULL,
  "stage" text,
  "params" jsonb,
  "input" bytea,
  "input_mime" text,
  "attempts" integer DEFAULT 0 NOT NULL,
  "watermarked" bytea,
  "clean" bytea,
  "mime" text DEFAULT 'video/mp4' NOT NULL,
  "price_cents" integer DEFAULT 4900 NOT NULL,
  "unlocked" boolean DEFAULT false NOT NULL,
  "error" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "video_job_orders" (
  "order_id" uuid PRIMARY KEY NOT NULL REFERENCES "orders"("id") ON DELETE cascade,
  "video_job_id" uuid NOT NULL REFERENCES "video_jobs"("id") ON DELETE cascade,
  "purpose" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
