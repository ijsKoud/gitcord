import { IgloClient } from "@snowcrystals/iglo";
import { BOT_COMMANDS_DIR, BOT_INTERACTIONS_DIR, BOT_LISTENER_DIR } from "./constants.js";

export default class GitCordClient extends IgloClient {
	public constructor() {
		super({
			client: { intents: ["GuildWebhooks", "Guilds"], allowedMentions: { repliedUser: true, roles: [], users: [] } },
			paths: { commands: BOT_COMMANDS_DIR, events: BOT_LISTENER_DIR, interactions: BOT_INTERACTIONS_DIR },
			logger: { defaultFormat: { infix: "[BOT]" } }
		});
	}

	/** Starts the Discord bot and it's processes */
	public start() {
		void this.run(process.env.DISCORD_BOT_TOKEN);
		console.log(this.listenerCount("ready"));
	}
}
