import { GuildForumModel, GuildModel, type GuildSelectModel, GuildWebhookModel, type GuildWebhookSelectModel } from "@/database";
import { HTTPError, HTTPStatus } from "@/shared/errors/HTTPError.js";

import { WebhookDispatch } from "./WebhookDispatch.js";

export class DiscordChannelManager {
	public readonly guildModel: GuildModel;
	public readonly guildForumModel: GuildForumModel;
	public readonly guildWebhookModel: GuildWebhookModel;
	public readonly dispatch: WebhookDispatch;

	public constructor() {
		this.guildModel = new GuildModel();
		this.guildForumModel = new GuildForumModel();
		this.guildWebhookModel = new GuildWebhookModel();
		this.dispatch = new WebhookDispatch();
	}

	/**
	 * Get the webhook for the given guild and repository
	 * @param guildId The guild to get the webhook from
	 * @param repository The repository name
	 * @returns the webhook url
	 */
	public async getWebhook(guildId: string, webhookId: string, repository: string | null) {
		const guild = await this.guildModel.get(guildId);
		const webhook = await this.guildWebhookModel.get(webhookId);
		if (!guild) return Promise.reject(new HTTPError(HTTPStatus.NOT_FOUND, "Guild not found"));
		if (!webhook) return Promise.reject(new HTTPError(HTTPStatus.NOT_FOUND, "Webhook not found"));

		if (webhook.type === "forum") {
			if (!repository) return Promise.reject(new HTTPError(HTTPStatus.BAD_REQUEST, "Missing repository in payload"));
			const url = await this.getForumWebhook(guild, webhook, repository);
			return { url, secret: webhook.secret };
		}

		return { url: webhook.webhook, secret: webhook.secret };
	}

	/**
	 * Get the forum webhook for the given guild and repository
	 * @param guild The guild to get the webhook for
	 * @param repository The repository name
	 * @returns the webhook url
	 */
	public async getForumWebhook(guild: GuildSelectModel, webhook: GuildWebhookSelectModel, repository: string) {
		const form = await this.guildForumModel.getByRepositoryGuild(guild.id, webhook.id, repository);
		if (!form) return this.createForumChannel(guild, webhook, repository);

		return `${webhook.webhook}?thread_id=${form.post}`;
	}

	/**
	 * Create a new forum channel for the given webhook and repository
	 * @param webhook The webhook linked to the forum
	 * @param repository The repository name
	 * @returns
	 */
	public async createForumChannel(guild: GuildSelectModel, webhook: GuildWebhookSelectModel, repository: string) {
		const url = new URL(webhook.webhook);
		const route = url.pathname as `/${string}`;
		const res = await this.dispatch.post(`${route}?wait=true`, {
			thread_name: repository,
			content: `GitHub notifications for **${repository}**:\nhttps://github.com/${repository}`
		});

		const data = await res.json();
		if (typeof data !== "object" || !data || !("channel_id" in data))
			return Promise.reject(new HTTPError(HTTPStatus.INTERNAL_SERVER_ERROR, "Invalid response from Discord"));

		if (typeof data.channel_id !== "string")
			return Promise.reject(new HTTPError(HTTPStatus.INTERNAL_SERVER_ERROR, "Invalid channel ID from Discord"));

		await this.guildForumModel.create([{ guildId: guild.id, webhookId: webhook.id, repository, post: data.channel_id }]);
		return `${webhook.webhook}?thread_id=${data.channel_id}`;
	}
}
