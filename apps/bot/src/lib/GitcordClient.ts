import { IgloClient, LogLevel } from "@snowcrystals/iglo";

import { env } from "@/shared/env.js";

import { BOT_COMMANDS_DIR, BOT_LISTENER_DIR } from "./constants.js";

export default class GitCordClient extends IgloClient {
	public constructor() {
		super({
			client: { intents: ["GuildWebhooks", "Guilds"], allowedMentions: { repliedUser: true, roles: [], users: [] } },
			paths: { commands: BOT_COMMANDS_DIR, events: BOT_LISTENER_DIR },
			logger: { level: process.env.NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info, parser: { depth: 2 } }
		});
	}

	/** Starts the Discord bot and its processes */
	public start() {
		return this.run(env.DISCORD_BOT_TOKEN!);
	}
}
