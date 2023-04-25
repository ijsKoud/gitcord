import type GitCordClient from "#discord/lib/GitCordClient.js";
import { ApplyOptions, EventListener, type EventListenerOptions } from "@snowcrystals/iglo";
import { bold } from "colorette";
import { Guild } from "discord.js";

@ApplyOptions<EventListenerOptions>({ name: "guildCreate" })
export default class extends EventListener<GitCordClient> {
	public override async run(guild: Guild) {
		await this.client.databaseManager.createGuild(guild);
		this.client.logger.debug(`(GuildCreate Event): Config created for guild ${bold(guild.name)}: ${guild.id}`);
	}
}
