ALTER TABLE "guild_webhooks" RENAME TO "guild_webhook";--> statement-breakpoint
ALTER TABLE "guild_forum" DROP CONSTRAINT "guild_forum_webhook_id_guild_webhooks_id_fk";
--> statement-breakpoint
ALTER TABLE "guild_webhook" DROP CONSTRAINT "guild_webhooks_guild_id_guild_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guild_forum" ADD CONSTRAINT "guild_forum_webhook_id_guild_webhook_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "guild_webhook"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guild_webhook" ADD CONSTRAINT "guild_webhook_guild_id_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
