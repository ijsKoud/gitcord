import { ApplyOptions, Command, type CommandOptions } from "@snowcrystals/iglo";
import { type CommandInteraction, ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import type GitCordClient from "#discord/lib/GitCordClient.js";

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
	public override async autocomplete(interaction: AutocompleteInteraction<"cached">) {
		const input = interaction.options.get("webhook", true);
		const config = this.client.databaseManager.configs.get(interaction.guildId);
		if (!config) {
			await interaction.respond([]);
			return;
		}

		const getChannelName = (id: string) => {
			const channel = this.client.channels.cache.get(id);
			return channel?.toString() || `#${id}`;
		};

		if (!input.value || typeof input.value !== "string") {
			await interaction.respond(config.webhooks.map((webhook) => ({ name: getChannelName(webhook.id), value: webhook.id })));
			return;
		}

		const inputValue = input.value as string; // The command input type is a string
		const allOptions = config.webhooks.map((webhook) => webhook.id);
		const options = allOptions.filter((opt) => opt.startsWith(inputValue) || opt.endsWith(inputValue) || opt.includes(inputValue));

		await interaction.respond(options.map((opt) => ({ name: getChannelName(opt), value: opt })));
	}

	public override async run(interaction: CommandInteraction<"cached">) {
		const config = this.client.databaseManager.configs.get(interaction.guildId);
		if (!config) throw new Error(`Missing config for guild with id ${interaction.guildId}`);

		await interaction.deferReply();
		const webhookId = interaction.options.get("webhook", true);
		if (!webhookId.value || typeof webhookId.value !== "string") return; // Fixes intellisense

		const webhook = await config.delete(webhookId.value as string);
		if (!webhook) {
			await interaction.followUp("No webhook was found with the provided id");
			return;
		}

		await interaction.followUp("Webhook deleted.");
	}
}
