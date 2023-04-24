import { ApplyOptions, Command, type CommandOptions } from "@snowcrystals/iglo";
import { EmbedBuilder, type CommandInteraction } from "discord.js";
import type GitCordClient from "#discord/lib/GitCordClient.js";

@ApplyOptions<CommandOptions>({
	name: "webhooks",
	description: "Returns the list of created webhooks in this guild",
	permissions: { dm: false, default: ["ManageGuild"] }
})
export default class extends Command<GitCordClient> {
	public override async run(interaction: CommandInteraction<"cached">) {
		const config = this.client.databaseManager.configs.get(interaction.guildId);
		const embed = new EmbedBuilder()
			.setTitle(`List of created webhooks`)
			.setDescription(`${config!.webhooks.size} out of 3 slots used.`)
			.addFields(
				config!.webhooks.map((webhook) => ({
					name: webhook.id,
					value: [`Type: \`${webhook.type.toLowerCase()}\``, `Channel: <#${webhook.id}>`].join("\n")
				}))
			);

		await interaction.reply({ embeds: [embed] });
	}
}
