import type GitCordClient from "#discord/lib/GitCordClient.js";
import { ApplyOptions, EventListener, type EventListenerOptions } from "@snowcrystals/iglo";
import { bold } from "colorette";
import { Guild } from "discord.js";

@ApplyOptions<EventListenerOptions>({ name: "guildDelete" })
export default class extends EventListener<GitCordClient> {
	public override async run(guild: Guild) {
		await this.client.databaseManager.deleteGuild(guild.id);
		this.client.logger.debug(`(GuildDelete Event): Config deleted of guild ${bold(guild.name)}: ${guild.id}`);
	}
}
