import { GitHubEmbed, type GitHubEmbedOptions } from "#github/lib/embed/structures/GitHubEmbed.js";
import type { CommitCommentEvent } from "@octokit/webhooks-types";
import type { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "#github/lib/embed/decorators.js";
import { EmbedLimits } from "@sapphire/discord-utilities";
import markdownParser from "#github/lib/embed/MarkdownParser.js";

@ApplyOptions<GitHubEmbedOptions>({ name: "commit_comment" })
export default class extends GitHubEmbed {
	public override run(event: CommitCommentEvent, embed: EmbedBuilder) {
		const commit = event.comment.commit_id.slice(0, 7);
		const commitUrl = `https://github.com/${event.repository.full_name}/commit/${event.comment.commit_id}`;

		embed
			.setURL(event.comment.html_url)
			.setDescription(markdownParser(event.comment.body).slice(0, EmbedLimits.MaximumDescriptionLength))
			.addFields([{ name: "On commit", value: `[\`${commit}\`](${commitUrl})` }]);

		return embed;
	}
}
