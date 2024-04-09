CREATE TABLE IF NOT EXISTS "guild_form" (
	"id" varchar PRIMARY KEY NOT NULL,
	"guild_id" varchar NOT NULL,
	"repository" varchar NOT NULL,
	"forum_post" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guild_form" ADD CONSTRAINT "guild_form_guild_id_guild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
