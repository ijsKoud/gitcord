import { and, eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { autoInjectable, inject } from "tsyringe";

import { QueryClient } from "#core/QueryClient.js";
import { GuildFormTable } from "#lib/schema.js";
import type { iModel } from "#types/iModel.js";

@autoInjectable()
export class GuildFormModel implements iModel<GuildFormSelectModel, GuildFormInsertModel> {
	public readonly queryClient: QueryClient;

	public constructor(@inject(QueryClient) queryClient?: QueryClient) {
		this.queryClient = queryClient!;
	}

	/**
	 * Get a guild form by its id
	 * @param id The guild form id
	 * @returns The guild form
	 * @example
	 * ```typescript
	 * const form = await GuildFormTable.get("1234567890");
	 * ```
	 */
	public async get(id: string) {
		const form = await this.queryClient.db.select().from(GuildFormTable).where(eq(GuildFormTable.id, id));
		return form[0] || null;
	}

	/**
	 * Get a guild form by its guild id and repository name
	 * @param guildId The guild id
	 * @param repository The repository name
	 * @returns The guild form
	 * @example
	 * ```typescript
	 * const form = await GuildFormTable.get("1234567890", "ijsKoud/gitcord");
	 * ```
	 */
	public async getByRepositoryGuild(guildId: string, repository: string) {
		const form = await this.query.select.where(and(eq(GuildFormTable.guildId, guildId), eq(GuildFormTable.repository, repository)));
		return form[0] || null;
	}

	/**
	 * Get all guild forms
	 * @returns All guild forms
	 * @example
	 * ```typescript
	 * const forms = await GuildFormTable.getAll();
	 * ```
	 */
	public getAll() {
		return this.queryClient.db.select().from(GuildFormTable);
	}

	/**
	 * Update a guild form by its id
	 * @param id The guild form id
	 * @param data The data to update
	 * @returns The updated guild form
	 * @example
	 * ```typescript
	 * const updatedGuildForm = await GuildFormTable.update("1234567890", { guild: "1234567890" });
	 * ```
	 */
	public async update(id: string, data: Partial<GuildFormInsertModel>) {
		await this.queryClient.db.update(GuildFormTable).set(data).where(eq(GuildFormTable.id, id));
		return this.get(id);
	}

	/**
	 * Create a guild form
	 * @param data The data to create
	 * @returns The created guild
	 * @example
	 * ```typescript
	 * const form = await GuildFormTable.create([{ id: "1234567890", guild: "...", ...rest }]);
	 * ```
	 */
	public create(data: GuildFormInsertModel[]) {
		return this.queryClient.db.insert(GuildFormTable).values(data).returning();
	}

	/**
	 * Delete a guild form by its id
	 * @param id The guild form id
	 * @example
	 * ```typescript
	 * await GuildFormTable.delete("1234567890");
	 * ```
	 */
	public async delete(id: string) {
		await this.queryClient.db.delete(GuildFormTable).where(eq(GuildFormTable.id, id));
	}

	public get query() {
		return {
			select: this.queryClient.db.select().from(GuildFormTable),
			update: this.queryClient.db.update(GuildFormTable),
			insert: this.queryClient.db.insert(GuildFormTable),
			delete: this.queryClient.db.delete(GuildFormTable)
		};
	}
}

export type GuildFormSelectModel = InferSelectModel<typeof GuildFormTable>;
export type GuildFormInsertModel = InferInsertModel<typeof GuildFormTable>;
