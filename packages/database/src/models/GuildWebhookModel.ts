import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { autoInjectable, inject } from "tsyringe";

import { QueryClient } from "#core/QueryClient.js";
import { GuildWebhooksTable } from "#lib/schema.js";
import type { iModel } from "#types/iModel.js";

@autoInjectable()
export class GuildWebhookModel implements iModel<GuildWebhookSelectModel, GuildWebhookInsertModel> {
	public readonly queryClient: QueryClient;

	public constructor(@inject(QueryClient) queryClient?: QueryClient) {
		this.queryClient = queryClient!;
	}

	/**
	 * Get a guild by its id
	 * @param guildId The guild id
	 * @returns The guild
	 * @example
	 * ```typescript
	 * const guild = await GuildWebhooksTable.get("1234567890");
	 * ```
	 */
	public async get(guildId: string) {
		const guilds = await this.queryClient.db.select().from(GuildWebhooksTable).where(eq(GuildWebhooksTable.id, guildId));
		return guilds[0] || null;
	}

	/**
	 * Get all guilds
	 * @returns All guilds
	 * @example
	 * ```typescript
	 * const guilds = await GuildWebhooksTable.getAll();
	 * ```
	 */
	public getAll() {
		return this.queryClient.db.select().from(GuildWebhooksTable);
	}

	/**
	 * Update a guild by its id
	 * @param guildId The guild id
	 * @param data The data to update
	 * @returns The updated guild
	 * @example
	 * ```typescript
	 * const updatedGuild = await GuildWebhooksTable.update("1234567890", { webhook: "https://example.com" });
	 * ```
	 */
	public async update(guildId: string, data: Partial<GuildWebhookInsertModel>) {
		await this.queryClient.db.update(GuildWebhooksTable).set(data).where(eq(GuildWebhooksTable.id, guildId));
		return this.get(guildId);
	}

	/**
	 * Create a guild
	 * @param data The data to create
	 * @returns The created guild
	 * @example
	 * ```typescript
	 * const guild = await GuildWebhooksTable.create([{ id: "1234567890", webhook: "https://example.com" }]);
	 * ```
	 */
	public create(data: GuildWebhookInsertModel[]) {
		return this.queryClient.db.insert(GuildWebhooksTable).values(data).returning();
	}

	/**
	 * Delete a guild by its id
	 * @param guildId The guild id
	 * @example
	 * ```typescript
	 * await GuildWebhooksTable.delete("1234567890");
	 * ```
	 */
	public async delete(guildId: string) {
		await this.queryClient.db.delete(GuildWebhooksTable).where(eq(GuildWebhooksTable.id, guildId));
	}

	public get query() {
		return {
			select: this.queryClient.db.select().from(GuildWebhooksTable),
			update: this.queryClient.db.update(GuildWebhooksTable),
			insert: this.queryClient.db.insert(GuildWebhooksTable),
			delete: this.queryClient.db.delete(GuildWebhooksTable)
		};
	}
}

export type GuildWebhookSelectModel = InferSelectModel<typeof GuildWebhooksTable>;
export type GuildWebhookInsertModel = InferInsertModel<typeof GuildWebhooksTable>;
