-- Product tag for paid image orders (single-image | pack-4 | product-photo).
-- The composer service selector writes this at quote time so the operator
-- can see WHICH product the customer bought (4-pack = 4 takes, product
-- photo = studio-grade product brief). Defaults to single-image for all
-- jobs quoted before this column existed.
--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD COLUMN "product" text DEFAULT 'single-image' NOT NULL;
