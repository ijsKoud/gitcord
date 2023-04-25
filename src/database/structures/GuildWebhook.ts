import type { ChannelType, GuildWebhook, Prisma } from "@prisma/client";
import type GitCordGuild from "./Guild.js";
import { Collection, WebhookClient } from "discord.js";
import { z } from "zod";
import { SnowflakeRegex } from "@sapphire/discord-utilities";

export default class GitCordGuildWebhook {
	public id: string;
	public type: ChannelType;

	public secret: string;
	public discordUrl: string;

	public repositories = new Collection<string, string>();
	public discordWebhook: WebhookClient;

	public constructor(public guild: GitCordGuild, webhook: GuildWebhook) {
		this.id = webhook.webhookId;
		this.type = webhook.type;

		this.secret = webhook.webhookSecret;
		this.discordUrl = webhook.webhookUrl;

		this.discordWebhook = new WebhookClient({ url: webhook.webhookUrl });
		this.parseRepositories(webhook.repositories);
	}

	/** Returns the webhook web path */
	public toString() {
		return `/webhook/${this.guild.guildId}/${this.id}`;
	}

	/**
	 * Adds a repository to the list of repositories
	 * @param repository The repository to add
	 * @param threadId The thread associated with the thread
	 */
	public async setRepository(repository: string, threadId: string) {
		this.repositories.set(repository, threadId);

		const prismaRepositories = this.repositories.map((thread, repo) => ({ [repo]: thread })).reduce((a, b) => ({ ...a, ...b }), {});
		await this.guild.client.prisma.guildWebhook.update({ where: { webhookId: this.id }, data: { repositories: prismaRepositories } });
	}

	private parseRepositories(repositories: Prisma.JsonValue[]) {
		const schema = z.array(
			z.object({
				name: z.string().nonempty(),
				threadId: z.string().regex(SnowflakeRegex)
			})
		);

		try {
			const result = schema.parse(repositories);
			result.forEach((repo) => this.repositories.set(repo.name, repo.threadId));
		} catch (error) {}
	}
}
