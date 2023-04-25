import { GitHubEmbed, type GitHubEmbedOptions } from "#github/lib/embed/structures/GitHubEmbed.js";
import type { MemberEvent } from "@octokit/webhooks-types";
import type { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "#github/lib/embed/decorators.js";

@ApplyOptions<GitHubEmbedOptions>({ name: "member" })
export default class extends GitHubEmbed {
	public override run(event: MemberEvent, embed: EmbedBuilder) {
		const updatedTitle = embed.data.title!.replace("Member", "Collaborator");
		embed.setTitle(updatedTitle).setDescription(`Collaborator: [${event.member.login}](${event.member.html_url})`);

		return embed;
	}
}
