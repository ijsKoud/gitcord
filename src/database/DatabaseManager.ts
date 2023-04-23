import type GitCordClient from "#discord/lib/GitCordClient.js";
import { Collection } from "discord.js";
import GitCordGuild from "./structures/Guild.js";

export default class DatabaseManager {
	public configs = new Collection<string, GitCordGuild>();

	public constructor(public client: GitCordClient) {}

	public async init() {
		const guilds = this.client.guilds.cache;
		const guildConfigs = await this.client.prisma.guild.findMany({ include: { guildWebhooks: true } });

		const missingConfigs = guilds.filter((guild) => !guildConfigs.find((config) => config.guildId === guild.id));
		const missingGuilds = guildConfigs.filter((config) => !guilds.get(config.guildId));

		await this.client.prisma.guildWebhook.deleteMany({ where: { guildId: { in: missingGuilds.map((config) => config.guildId) } } });
		await this.client.prisma.guild.deleteMany({ where: { guildId: { in: missingGuilds.map((config) => config.guildId) } } });

		for await (const missingConfig of [...missingConfigs.values()]) {
			const config = await this.client.prisma.guild.create({ data: { guildId: missingConfig.id }, include: { guildWebhooks: true } });
			guildConfigs.push(config);
		}

		for (const config of guildConfigs) {
			const guildConfig = new GitCordGuild(this.client);
			if (!guildConfig.init(config)) continue;

			this.configs.set(guildConfig.guildId, guildConfig);
		}
	}
}
