-- Add bcrypt password hash column for credentials (email+password) login.
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;
