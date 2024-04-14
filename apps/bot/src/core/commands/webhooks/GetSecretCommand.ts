import { ApplyOptions, Command, type CommandOptions } from "@snowcrystals/iglo";
import { ApplicationCommandOptionType, type AutocompleteInteraction, type CommandInteraction } from "discord.js";
import { eq } from "drizzle-orm";

import { GuildWebhookModel, GuildWebhooksTable } from "@/database";
import type GitCordClient from "#lib/GitcordClient.js";

@ApplyOptions<CommandOptions>({
	name: "secret",
	description: "Get the secret key of a webhook",
	permissions: { dm: false, default: ["ManageGuild"] },
	options: [
		{
			name: "webhook",
			description: "The webhook id",
			type: ApplicationCommandOptionType.String,
			autocomplete: true,
			required: true
		}
	]
})
export default class extends Command<GitCordClient> {
	public readonly guildWebhookModel = new GuildWebhookModel();

	public override async autocomplete(interaction: AutocompleteInteraction<"cached">) {
		// const input = interaction.options.get("webhook", true);
		const webhooks = await this.guildWebhookModel.query.select.where(eq(GuildWebhooksTable.guildId, interaction.guildId));
		if (!webhooks) {
			await interaction.respond([]);
			return;
		}

		const getChannel = async (id: string) => {
			const channel = await this.client.channels.fetch(id).catch(() => null);
			return { name: channel?.toString() || `#${id}`, value: id };
		};

		const channels = await Promise.all(webhooks.map((webhook) => getChannel(webhook.id)));
		await interaction.respond(channels);
	}

	public override async run(interaction: CommandInteraction<"cached">) {
		const webhookId = interaction.options.get("webhook", true);
		const webhook = await this.guildWebhookModel.get(webhookId.value as string);
		if (!webhook) {
			await interaction.reply({ content: "No webhook found with the provided id", ephemeral: true });
			return;
		}

		await interaction.reply({
			content: `The secret for this webhook: \`${webhook.secret}\` --- URL: ${process.env.API_BASE_URL}/webhook/${webhook.guildId}/${webhook.id}`,
			ephemeral: true
		});
	}
}
