import { ApplyOptions, EventListener, type EventListenerOptions } from "@snowcrystals/iglo";
import { bold } from "colorette";
import type { Guild } from "discord.js";

import { GuildModel } from "@/database";
import type GitCordClient from "#lib/GitcordClient.js";

@ApplyOptions<EventListenerOptions>({ name: "guildDelete" })
export default class extends EventListener<GitCordClient> {
	public readonly guildModel = new GuildModel();

	public override async run(guild: Guild) {
		await this.guildModel.delete(guild.id);
		this.client.logger.debug(`[Discord]--(GuilDelete Event): Config deleted for guild ${bold(guild.name)}: ${guild.id}`);
	}
}
