import { ApplyOptions, Command, type CommandOptions } from "@snowcrystals/iglo";
import { type CommandInteraction, EmbedBuilder } from "discord.js";
import { eq } from "drizzle-orm";

import { GuildWebhookModel, GuildWebhooksTable } from "@/database";
import type GitCordClient from "#lib/GitcordClient.js";

@ApplyOptions<CommandOptions>({
	name: "webhooks",
	description: "Returns the list of created webhooks in this guild",
	permissions: { dm: false, default: ["ManageGuild"] }
})
export default class extends Command<GitCordClient> {
	public readonly guildWebhookModel = new GuildWebhookModel();

	public override async run(interaction: CommandInteraction<"cached">) {
		const webhooks = await this.guildWebhookModel.query.select.where(eq(GuildWebhooksTable.guildId, interaction.guildId));
		const embed = new EmbedBuilder()
			.setTitle(`List of created webhooks`)
			.setDescription(`${webhooks.length} out of 3 slots used.`)
			.addFields(
				webhooks.map((webhook) => ({
					name: webhook.id,
					value: [`Type: \`${webhook.type.toLowerCase()}\``, `Channel: <#${webhook.id}>`].join("\n")
				}))
			);

		await interaction.reply({ embeds: [embed] });
	}
}
