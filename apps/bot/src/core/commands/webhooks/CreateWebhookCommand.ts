import { randomBytes } from "node:crypto";

import { ApplyOptions, Command, type CommandOptions } from "@snowcrystals/iglo";
import { ApplicationCommandOptionType, ChannelType, type CommandInteraction, type ForumChannel, type TextChannel } from "discord.js";
import { eq } from "drizzle-orm";

import { GuildWebhookModel, GuildWebhooksTable } from "@/database";
import { GITHUB_AVATAR_URL, MAX_WEBHOOKS_PER_GUILD } from "@/shared/constants.js";
import type GitCordClient from "#lib/GitcordClient.js";

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
	public readonly guildWebhookModel = new GuildWebhookModel();

	public override async run(interaction: CommandInteraction<"cached">) {
		const webhooks = await this.guildWebhookModel.query.select.where(eq(GuildWebhooksTable.guildId, interaction.guildId));
		if (webhooks.length >= MAX_WEBHOOKS_PER_GUILD) {
			await interaction.reply(`You reached the webhook limit for this guild (${webhooks.length}/${MAX_WEBHOOKS_PER_GUILD} used)`);
			return;
		}

		await interaction.deferReply({ ephemeral: true });
		const channel = interaction.options.get("channel", true) as unknown as TextChannel | ForumChannel;
		const type = channel.type === ChannelType.GuildText ? "text" : "forum";

		const webhookUrl = await channel.createWebhook({ name: "GitCord", avatar: GITHUB_AVATAR_URL });
		const secret = randomBytes(64).toString("hex");

		await this.guildWebhookModel.create([
			{
				guildId: interaction.guildId,
				id: channel.id,
				webhook: webhookUrl.url,
				secret,
				type
			}
		]);

		await interaction.followUp({
			content: `Webhook created, url: \`${process.env.API_BASE_URL}/webhook/${interaction.guildId}/${channel.id}\` --- Secret: \`${secret}\``,
			ephemeral: true
		});
	}
}
