import { IgloClient } from "@snowcrystals/iglo";
import { BOT_COMMANDS_DIR, BOT_INTERACTIONS_DIR, BOT_LISTENER_DIR } from "./constants.js";
import GitHubManager from "../github/lib/GitHubManager.js";

export default class GitCordClient extends IgloClient {
	public githubManager = new GitHubManager(this);

	public constructor() {
		super({
			client: { intents: ["GuildWebhooks", "Guilds"], allowedMentions: { repliedUser: true, roles: [], users: [] } },
			paths: { commands: BOT_COMMANDS_DIR, events: BOT_LISTENER_DIR, interactions: BOT_INTERACTIONS_DIR }
		});
	}

	/** Starts the Discord bot and its processes */
	public start() {
		void this.run(process.env.DISCORD_BOT_TOKEN);
		void this.githubManager.init();
	}
}
