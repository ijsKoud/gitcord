import { and, eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { autoInjectable, inject } from "tsyringe";

import { QueryClient } from "#core/QueryClient.js";
import { GuildForumTable } from "#lib/schema.js";
import type { iModel } from "#types/iModel.js";

@autoInjectable()
export class GuildForumModel implements iModel<GuildForumSelectModel, GuildForumInsertModel> {
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
	 * const form = await GuildForumTable.get("1234567890");
	 * ```
	 */
	public async get(id: number) {
		const form = await this.queryClient.db.select().from(GuildForumTable).where(eq(GuildForumTable.id, id));
		return form[0] || null;
	}

	/**
	 * Get a guild form by its guild id and repository name
	 * @param guildId The guild id
	 * @param webhookId The webhook id
	 * @param repository The repository name
	 * @returns The guild form
	 * @example
	 * ```typescript
	 * const form = await GuildForumTable.get("1234567890", "1111111", "ijsKoud/gitcord");
	 * ```
	 */
	public async getByRepositoryGuild(guildId: string, webhookId: string, repository: string) {
		const form = await this.query.select.where(
			and(eq(GuildForumTable.guildId, guildId), eq(GuildForumTable.repository, repository), eq(GuildForumTable.webhookId, webhookId))
		);
		return form[0] || null;
	}

	/**
	 * Get all guild forms
	 * @returns All guild forms
	 * @example
	 * ```typescript
	 * const forms = await GuildForumTable.getAll();
	 * ```
	 */
	public getAll() {
		return this.queryClient.db.select().from(GuildForumTable);
	}

	/**
	 * Update a guild form by its id
	 * @param id The guild form id
	 * @param data The data to update
	 * @returns The updated guild form
	 * @example
	 * ```typescript
	 * const updatedGuildForum = await GuildForumTable.update("1234567890", { guild: "1234567890" });
	 * ```
	 */
	public async update(id: number, data: Partial<GuildForumInsertModel>) {
		await this.queryClient.db.update(GuildForumTable).set(data).where(eq(GuildForumTable.id, id));
		return this.get(id);
	}

	/**
	 * Create a guild form
	 * @param data The data to create
	 * @returns The created guild
	 * @example
	 * ```typescript
	 * const form = await GuildForumTable.create([{ id: "1234567890", guild: "...", ...rest }]);
	 * ```
	 */
	public create(data: GuildForumInsertModel[]) {
		return this.queryClient.db.insert(GuildForumTable).values(data).returning();
	}

	/**
	 * Delete a guild form by its id
	 * @param id The guild form id
	 * @example
	 * ```typescript
	 * await GuildForumTable.delete("1234567890");
	 * ```
	 */
	public async delete(id: number) {
		await this.queryClient.db.delete(GuildForumTable).where(eq(GuildForumTable.id, id));
	}

	public get query() {
		return {
			select: this.queryClient.db.select().from(GuildForumTable),
			update: this.queryClient.db.update(GuildForumTable),
			insert: this.queryClient.db.insert(GuildForumTable),
			delete: this.queryClient.db.delete(GuildForumTable)
		};
	}
}

export type GuildForumSelectModel = InferSelectModel<typeof GuildForumTable>;
export type GuildForumInsertModel = InferInsertModel<typeof GuildForumTable>;
