import { IgloClient, LogLevel } from "@snowcrystals/iglo";
import { BOT_COMMANDS_DIR, BOT_LISTENER_DIR } from "#shared/constants.js";
import GitHubManager from "#github/lib/GitHubManager.js";
import { PrismaClient } from "@prisma/client";
import DatabaseManager from "#database/DatabaseManager.js";

export default class GitCordClient extends IgloClient {
	public githubManager = new GitHubManager(this);
	public databaseManager = new DatabaseManager(this);

	public prisma = new PrismaClient();

	public constructor() {
		super({
			client: { intents: ["GuildWebhooks", "Guilds"], allowedMentions: { repliedUser: true, roles: [], users: [] } },
			paths: { commands: BOT_COMMANDS_DIR, events: BOT_LISTENER_DIR },
			logger: { level: process.env.NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info, depth: 2 }
		});
	}

	/** Starts the Discord bot and its processes */
	public start() {
		void this.run(process.env.DISCORD_BOT_TOKEN);
		void this.githubManager.init();

		void this.prisma.$connect().then(() => this.logger.info(`[PRISMA]: Connected to postgresql database.`));
	}
}
