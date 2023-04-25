import type GitCordClient from "#discord/lib/GitCordClient.js";
import { Collection, Guild } from "discord.js";
import GitCordGuild from "./structures/Guild.js";

export default class DatabaseManager {
	public configs = new Collection<string, GitCordGuild>();

	public constructor(public client: GitCordClient) {}

	/** Initialize the database manager */
	public async init() {
		const guilds = this.client.guilds.cache;
		const guildConfigs = await this.client.prisma.guild.findMany({ include: { guildWebhooks: true } });

		const missingConfigs = guilds.filter((guild) => !guildConfigs.find((config) => config.guildId === guild.id));
		const missingGuilds = guildConfigs.filter((config) => !guilds.get(config.guildId));

		// Delete configs of left guilds
		await this.client.prisma.guildWebhook.deleteMany({ where: { guildId: { in: missingGuilds.map((config) => config.guildId) } } });
		await this.client.prisma.guild.deleteMany({ where: { guildId: { in: missingGuilds.map((config) => config.guildId) } } });

		// Create missing configs for joined guilds
		for await (const missingConfig of [...missingConfigs.values()]) {
			const config = await this.client.prisma.guild.create({ data: { guildId: missingConfig.id }, include: { guildWebhooks: true } });
			guildConfigs.push(config);
		}

		// Load the guild configs
		for (const config of guildConfigs) {
			const guildConfig = new GitCordGuild(this.client);
			if (!guildConfig.init(config)) continue;

			this.configs.set(guildConfig.guildId, guildConfig);
		}
	}

	/**
	 * Creates a config for a guild
	 * @param guild The guild which requires a config
	 */
	public async createGuild(guild: Guild) {
		const prismaGuild = await this.client.prisma.guild.create({ data: { guildId: guild.id }, include: { guildWebhooks: true } });
		const gitcordGuild = new GitCordGuild(this.client);
		gitcordGuild.init(prismaGuild);

		this.configs.set(guild.id, gitcordGuild);
	}

	/**
	 * Deletes a guild config from the database and cache
	 * @param guildId The id of the guild to delete
	 */
	public async deleteGuild(guildId: string) {
		if (!this.configs.has(guildId)) return;

		await this.client.prisma.guildWebhook.deleteMany({ where: { guildId } });
		await this.client.prisma.guild.delete({ where: { guildId } });
		this.configs.delete(guildId);
	}
}
