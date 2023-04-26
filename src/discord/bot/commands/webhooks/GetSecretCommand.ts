import { ApplyOptions, Command, type CommandOptions } from "@snowcrystals/iglo";
import { type CommandInteraction, ApplicationCommandOptionType, AutocompleteInteraction } from "discord.js";
import type GitCordClient from "#discord/lib/GitCordClient.js";

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
	public override async autocomplete(interaction: AutocompleteInteraction<"cached">) {
		const input = interaction.options.get("webhook", true);
		const config = this.client.databaseManager.configs.get(interaction.guildId);
		if (!config) {
			await interaction.respond([]);
			return;
		}

		if (!input.value || typeof input.value !== "string") {
			await interaction.respond(config.webhooks.map((webhook) => ({ name: webhook.id, value: webhook.id })));
			return;
		}

		const inputValue = input.value as string; // The command input type is a string
		const allOptions = config.webhooks.map((webhook) => webhook.id);
		const options = allOptions.filter((opt) => opt.startsWith(inputValue) || opt.endsWith(inputValue) || opt.includes(inputValue));

		await interaction.respond(options.map((opt) => ({ name: opt, value: opt })));
	}

	public override async run(interaction: CommandInteraction<"cached">) {
		const config = this.client.databaseManager.configs.get(interaction.guildId);
		if (!config) throw new Error(`Missing config for guild with id ${interaction.guildId}`);

		const webhookId = interaction.options.get("webhook", true);
		const webhook = config.webhooks.get(webhookId.value as string);
		if (!webhook) {
			await interaction.reply({ content: "No webhook found with the provided id", ephemeral: true });
			return;
		}

		await interaction.reply({
			content: `The secret for this webhook: \`${webhook.secret}\` --- URL: ${process.env.API_BASE_URL}${webhook}`,
			ephemeral: true
		});
	}
}
