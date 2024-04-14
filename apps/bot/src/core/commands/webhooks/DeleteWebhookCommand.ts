import { ApplyOptions, Command, type CommandOptions } from "@snowcrystals/iglo";
import { ApplicationCommandOptionType, type AutocompleteInteraction, type CommandInteraction } from "discord.js";
import { eq } from "drizzle-orm";

import { GuildWebhookModel, GuildWebhooksTable } from "@/database";
import type GitCordClient from "#lib/GitcordClient.js";

@ApplyOptions<CommandOptions>({
	name: "delete",
	description: "Deletes a webhook",
	permissions: { dm: false, default: ["ManageGuild"] },
	options: [
		{
			name: "webhook",
			description: "The channel the webhook is connected to",
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
		const webhooks = await this.guildWebhookModel.query.select.where(eq(GuildWebhooksTable.guildId, interaction.guildId));
		if (!webhooks) {
			await interaction.reply("No webhooks found");
			return;
		}

		await interaction.deferReply();

		const webhookId = interaction.options.get("webhook", true);
		if (!webhookId.value || typeof webhookId.value !== "string") return; // Fixes intellisense

		if (!webhooks.some((webhook) => webhook.id === webhookId.value)) {
			await interaction.followUp("No webhook was found with the provided id");
			return;
		}

		await this.guildWebhookModel.delete(webhookId.value);
		await interaction.followUp("Webhook deleted.");
	}
}
