import { ApplyOptions, EventListener, type EventListenerOptions } from "@snowcrystals/iglo";
import { bold } from "colorette";
import type { Guild } from "discord.js";

import { GuildModel } from "@/database";
import type GitCordClient from "#lib/GitcordClient.js";

@ApplyOptions<EventListenerOptions>({ name: "guildCreate" })
export default class extends EventListener<GitCordClient> {
	public readonly guildModel = new GuildModel();

	public override async run(guild: Guild) {
		await this.guildModel.create([{ id: guild.id }]);
		this.client.logger.debug(`[Discord]--(GuildCreate Event): Config created for guild ${bold(guild.name)}: ${guild.id}`);
	}
}
