CREATE TABLE IF NOT EXISTS "guild_webhooks" (
	"id" varchar PRIMARY KEY NOT NULL,
	"guild_id" varchar NOT NULL,
	"webhook" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guild_forum" ADD COLUMN "webhook_id" varchar NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guild_forum" ADD CONSTRAINT "guild_forum_webhook_id_guild_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "guild_webhooks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "guild" DROP COLUMN IF EXISTS "webhook";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guild_webhooks" ADD CONSTRAINT "guild_webhooks_guild_id_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
