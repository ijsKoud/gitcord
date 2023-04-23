import type { GuildConfig } from "#database/types.js";
import type GitCordClient from "#discord/lib/GitCordClient.js";
import { Collection, Guild } from "discord.js";
import GitCordGuildWebhook from "./GuildWebhook.js";

export default class GitCordGuild {
	public guild!: Guild;
	public guildId!: string;

	public webhooks = new Collection<string, GitCordGuildWebhook>();

	public constructor(public client: GitCordClient) {}

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
}
