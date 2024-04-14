ALTER TABLE "guild_form" DROP CONSTRAINT "guild_form_guild_id_guild_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guild_form" ADD CONSTRAINT "guild_form_guild_id_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
