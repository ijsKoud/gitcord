import { ApplyOptions, Command, type CommandOptions } from "@snowcrystals/iglo";
import { type CommandInteraction, ApplicationCommandOptionType, ChannelType, type TextChannel, type ForumChannel } from "discord.js";
import type GitCordClient from "#discord/lib/GitCordClient.js";

@ApplyOptions<CommandOptions>({
	name: "create",
	description: "Creates a new webhook",
	permissions: { dm: false, default: ["ManageGuild"] },
	options: [
		{
			name: "channel",
			description: "The channel to post the messages in",
			type: ApplicationCommandOptionType.Channel,
			channelTypes: [ChannelType.GuildText, ChannelType.GuildForum],
			required: true
		}
	]
})
export default class extends Command<GitCordClient> {
	public override async run(interaction: CommandInteraction<"cached">) {
		const config = this.client.databaseManager.configs.get(interaction.guildId);
		if (!config || config.webhooks.size >= 3) {
			await interaction.reply("You reached the webhook limit for this guild (3/3 used)");
			return;
		}

		await interaction.deferReply({ ephemeral: true });
		const channel = interaction.options.get("channel", true);
		if (!channel.channel || ![ChannelType.GuildText, ChannelType.GuildForum].includes(channel.channel.type)) return; // Fixes intellisense

		const webhook = await config.create(channel.channel as TextChannel | ForumChannel);
		await interaction.followUp({ content: `Webhook created, url: \`${webhook}\` --- Secret: \`${webhook.secret}\``, ephemeral: true });
	}
}
