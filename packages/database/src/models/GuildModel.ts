import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { autoInjectable, inject } from "tsyringe";

import { QueryClient } from "#core/QueryClient.js";
import { GuildTable } from "#lib/schema.js";
import type { iModel } from "#types/iModel.js";

@autoInjectable()
export class GuildModel implements iModel<GuildSelectModel, GuildInsertModel> {
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
	 * const guild = await GuildTable.get("1234567890");
	 * ```
	 */
	public async get(guildId: string) {
		const guilds = await this.queryClient.db.select().from(GuildTable).where(eq(GuildTable.id, guildId));
		return guilds[0] || null;
	}

	/**
	 * Get all guilds
	 * @returns All guilds
	 * @example
	 * ```typescript
	 * const guilds = await GuildTable.getAll();
	 * ```
	 */
	public getAll() {
		return this.queryClient.db.select().from(GuildTable);
	}

	/**
	 * Update a guild by its id
	 * @param guildId The guild id
	 * @param data The data to update
	 * @returns The updated guild
	 * @example
	 * ```typescript
	 * const updatedGuild = await GuildTable.update("1234567890", { webhook: "https://example.com" });
	 * ```
	 */
	public async update(guildId: string, data: Partial<GuildInsertModel>) {
		await this.queryClient.db.update(GuildTable).set(data).where(eq(GuildTable.id, guildId));
		return this.get(guildId);
	}

	/**
	 * Create a guild
	 * @param data The data to create
	 * @returns The created guild
	 * @example
	 * ```typescript
	 * const guild = await GuildTable.create([{ id: "1234567890", webhook: "https://example.com" }]);
	 * ```
	 */
	public create(data: GuildInsertModel[]) {
		return this.queryClient.db.insert(GuildTable).values(data).returning();
	}

	/**
	 * Delete a guild by its id
	 * @param guildId The guild id
	 * @example
	 * ```typescript
	 * await GuildTable.delete("1234567890");
	 * ```
	 */
	public async delete(guildId: string) {
		await this.queryClient.db.delete(GuildTable).where(eq(GuildTable.id, guildId));
	}

	public get query() {
		return {
			select: this.queryClient.db.select().from(GuildTable),
			update: this.queryClient.db.update(GuildTable),
			insert: this.queryClient.db.insert(GuildTable),
			delete: this.queryClient.db.delete(GuildTable)
		};
	}
}

export type GuildSelectModel = InferSelectModel<typeof GuildTable>;
export type GuildInsertModel = InferInsertModel<typeof GuildTable>;
