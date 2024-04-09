import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export type WebhookType = "forum" | "text";

/** The Postgres table structure */
export const GuildTable = pgTable("guild", {
	id: varchar("id").primaryKey(),
	createdAt: timestamp("created_at").notNull().defaultNow()
});

export const GuildWebhooksTable = pgTable("guild_webhooks", {
	id: varchar("id").primaryKey(),
	guildId: varchar("guild_id")
		.notNull()
		.references(() => GuildTable.id, { onDelete: "cascade", onUpdate: "no action" }),
	type: varchar("webhook_type").$type<WebhookType>().notNull(),
	webhook: varchar("webhook").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow()
});

export const GuildForumTable = pgTable("guild_forum", {
	id: serial("id").primaryKey(),
	webhookId: varchar("webhook_id")
		.notNull()
		.references(() => GuildWebhooksTable.id, { onDelete: "cascade", onUpdate: "no action" }),
	guildId: varchar("guild_id")
		.notNull()
		.references(() => GuildTable.id, { onDelete: "cascade", onUpdate: "no action" }),
	repository: varchar("repository").notNull(),
	post: varchar("forum_post").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow()
});
