CREATE TABLE IF NOT EXISTS "generations" (
  "id" uuid PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "prompt" text NOT NULL,
  "quality" text DEFAULT 'studio' NOT NULL,
  "aspect_ratio" text DEFAULT '1:1' NOT NULL,
  "status" text DEFAULT 'queued' NOT NULL,
  "stage" text,
  "media_type" text DEFAULT 'image' NOT NULL,
  "tier" text DEFAULT 'free' NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "watermarked" bytea,
  "clean" bytea,
  "mime" text DEFAULT 'image/jpeg' NOT NULL,
  "error" text,
  "unlocked" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "delivered_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "generation_orders" (
  "order_id" uuid PRIMARY KEY NOT NULL REFERENCES "orders"("id") ON DELETE cascade,
  "generation_id" uuid NOT NULL REFERENCES "generations"("id") ON DELETE cascade,
  "purpose" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
