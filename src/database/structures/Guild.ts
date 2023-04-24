import type { GuildConfig } from "#database/types.js";
import type GitCordClient from "#discord/lib/GitCordClient.js";
import { ChannelType, Collection, ForumChannel, Guild, TextChannel } from "discord.js";
import GitCordGuildWebhook from "./GuildWebhook.js";
import { randomBytes } from "node:crypto";

export default class GitCordGuild {
	public guild!: Guild;
	public guildId!: string;

	public webhooks = new Collection<string, GitCordGuildWebhook>();

	public constructor(public client: GitCordClient) {}

	/** Initialize the guild config */
	public init(config: GuildConfig): boolean {
		if (!this.client.isReady()) throw new Error(`GitCordGuild: Initialized while client is still in loading state.`);

		const guild = this.client.guilds.cache.get(config.guildId);
		if (!guild) return false;

		this.guildId = config.guildId;
		this.guild = guild;

		for (const webhook of config.guildWebhooks) {
			const gitcordWebhook = new GitCordGuildWebhook(this, webhook);
			this.webhooks.set(gitcordWebhook.id, gitcordWebhook);
		}

		return true;
	}

	/**
	 * Creates a new webhook for GitHub notifications
	 * @param channel The channel the notifications should be posted in
	 * @throws Error with reason why the creation failed
	 */
	public async create(channel: ForumChannel | TextChannel) {
		const type = channel.type === ChannelType.GuildForum ? "FORUM" : "CHANNEL";
		const webhook = await channel.createWebhook({ name: "GitCord", avatar: "https://cdn.ijskoud.dev/files/2zVGPBN3ZmId.webp" }).catch(() => {
			throw new Error("Unable to create a webhook, probably missing permissions.");
		});

		const secret = randomBytes(64).toString("hex");

		const prismaData = await this.client.prisma.guildWebhook.create({
			data: { type, webhookUrl: webhook.url, guildId: this.guildId, webhookId: webhook.channelId, webhookSecret: secret }
		});

		const gitcordWebhook = new GitCordGuildWebhook(this, prismaData);
		this.webhooks.set(webhook.channelId, gitcordWebhook);

		return gitcordWebhook;
	}

	/**
	 * Deletes an existing webhook
	 * @param webhookId The webhook to delete
	 * @returns Boolean depending on the existence of the webhook
	 * @throws DiscordApiError if the webhook deletion fails
	 */
	public async delete(webhookId: string) {
		const webhook = this.webhooks.get(webhookId);
		if (!webhook) return false;

		await webhook.discordWebhook.delete();
		await this.client.prisma.guildWebhook.delete({ where: { webhookId } });

		this.webhooks.delete(webhookId);
		return true;
	}
}
