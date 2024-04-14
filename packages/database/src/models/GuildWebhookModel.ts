import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { autoInjectable, inject } from "tsyringe";

import { decrypt, encrypt } from "@/shared/utils.js";
import { QueryClient } from "#core/QueryClient.js";
import { GuildWebhooksTable, type WebhookType } from "#lib/schema.js";
import type { iModel } from "#types/iModel.js";

@autoInjectable()
export class GuildWebhookModel implements iModel<GuildWebhookSelectModel, GuildWebhookInsertModel> {
	public readonly queryClient: QueryClient;

	public constructor(@inject(QueryClient) queryClient?: QueryClient) {
		this.queryClient = queryClient!;
	}

	/**
	 * Get a webhook by its id
	 * @param id The webhook id
	 * @returns The webhook
	 * @example
	 * ```typescript
	 * const webhook = await guildWebhooksTable.get("1234567890");
	 * ```
	 */
	public async get(id: string) {
		const data = await this.queryClient.db.select().from(GuildWebhooksTable).where(eq(GuildWebhooksTable.id, id));
		const result = data[0] || null;
		if (!result) return null;

		result.secret = decrypt(result.secret);
		return result;
	}

	/**
	 * Get all webhook
	 * @returns All webhook
	 * @example
	 * ```typescript
	 * const webhook = await GuildWebhooksTable.getAll();
	 * ```
	 */
	public async getAll() {
		const webhooks = await this.queryClient.db.select().from(GuildWebhooksTable);
		return webhooks.map((webhook) => ({ ...webhook, secret: decrypt(webhook.secret) }));
	}

	/**
	 * Update a webhook by its id
	 * @param id The webhook id
	 * @param data The data to update
	 * @returns The updated webhook
	 * @example
	 * ```typescript
	 * const updatedWebhook = await GuildWebhooksTable.update("1234567890", { webhook: "https://example.com" });
	 * ```
	 */
	public async update(id: string, data: Partial<GuildWebhookInsertModel>) {
		const cloned = structuredClone(data);
		if (data.secret) cloned.secret = encrypt(data.secret);

		await this.queryClient.db.update(GuildWebhooksTable).set(cloned).where(eq(GuildWebhooksTable.id, id));
		return this.get(id) as Promise<GuildWebhookSelectModel>;
	}

	/**
	 * Create a webhook
	 * @param data The data to create
	 * @returns The created webhook
	 * @example
	 * ```typescript
	 * const webhook = await GuildWebhooksTable.create([{ id: "1234567890", webhook: "https://example.com" }]);
	 * ```
	 */
	public create(data: GuildWebhookInsertModel[]) {
		return this.queryClient.db
			.insert(GuildWebhooksTable)
			.values(data.map((d) => ({ ...d, secret: encrypt(d.secret) })))
			.returning();
	}

	/**
	 * Delete a webhook by its id
	 * @param ud The webhook id
	 * @example
	 * ```typescript
	 * await GuildWebhooksTable.delete("1234567890");
	 * ```
	 */
	public async delete(id: string) {
		await this.queryClient.db.delete(GuildWebhooksTable).where(eq(GuildWebhooksTable.id, id));
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
