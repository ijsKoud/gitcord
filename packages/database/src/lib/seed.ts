import { GuildModel, GuildWebhookModel } from "index.js";

import { env } from "@/shared/env.js";

async function seed() {
	if (!env.DEVELOPMENT_GUILD_ID || !env.DEVELOPMENT_WEBHOOK_ID || !env.DEVELOPMENT_WEBHOOK_URL || !env.WEBHOOK_SECRET)
		throw new Error("Missing development environment variables");

	const guildModel = new GuildModel();
	await guildModel.create([{ id: env.DEVELOPMENT_GUILD_ID }]);

	const guildWebhookModel = new GuildWebhookModel();
	await guildWebhookModel.create([
		{
			guildId: env.DEVELOPMENT_GUILD_ID,
			id: env.DEVELOPMENT_WEBHOOK_ID,
			webhook: env.DEVELOPMENT_WEBHOOK_URL,
			secret: env.WEBHOOK_SECRET,
			type: "text"
		}
	]);

	console.info("Seeded completed successfully");
}

await seed();
