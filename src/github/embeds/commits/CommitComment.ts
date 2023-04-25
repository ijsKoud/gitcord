import { GitHubEmbed, type GitHubEmbedOptions } from "#github/lib/embed/structures/GitHubEmbed.js";
import type { CommitCommentEvent } from "@octokit/webhooks-types";
import type { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "#github/lib/embed/decorators.js";
import { EmbedLimits } from "@sapphire/discord-utilities";

@ApplyOptions<GitHubEmbedOptions>({ name: "commit_comment" })
export default class extends GitHubEmbed {
	public override run(event: CommitCommentEvent, embed: EmbedBuilder) {
		const commit = event.comment.commit_id.slice(0, 7);
		embed
			.setDescription(event.comment.body.slice(0, EmbedLimits.MaximumDescriptionLength))
			.addFields([{ name: "On commit", value: `[\`${commit}\`](${event.comment.html_url})` }]);

		return embed;
	}
}
