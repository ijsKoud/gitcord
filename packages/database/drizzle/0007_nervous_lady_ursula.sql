ALTER TABLE "guild_webhooks" ADD COLUMN "webhook_type" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "guild" DROP COLUMN IF EXISTS "webhook_type";