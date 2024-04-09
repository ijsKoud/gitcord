import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export type WebhookType = "forum" | "text";

/** The Postgres table structure */
export const GuildTable = pgTable("guild", {
	id: varchar("id").primaryKey(),
	webhook: varchar("webhook").notNull(),
	type: varchar("webhook_type").$type<WebhookType>().notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow()
});

export const GuildForumTable = pgTable("guild_forum", {
	id: serial("id").primaryKey(),
	guildId: varchar("guild_id")
		.notNull()
		.references(() => GuildTable.id, { onDelete: "cascade", onUpdate: "no action" }),
	repository: varchar("repository").notNull(),
	post: varchar("forum_post").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow()
});
