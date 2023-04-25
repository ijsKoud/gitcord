import { GitHubEmbed, type GitHubEmbedOptions } from "#github/lib/embed/structures/GitHubEmbed.js";
import type { IssueCommentEvent } from "@octokit/webhooks-types";
import type { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "#github/lib/embed/decorators.js";
import { EmbedLimits } from "@sapphire/discord-utilities";

@ApplyOptions<GitHubEmbedOptions>({ name: "issue_comment" })
export default class extends GitHubEmbed {
	public override run(event: IssueCommentEvent, embed: EmbedBuilder) {
		if (event.action !== "created") return null;

		const isPr = Boolean(event.issue.pull_request);
		const issue = `${event.issue.title} (#${event.issue.number})`;

		embed
			.setTitle(`${event.repository.full_name} — ${isPr ? "Pull Request" : "Issue"} Comment Created`)
			.setURL(event.comment.html_url)
			.setDescription(event.comment.body.slice(0, EmbedLimits.MaximumDescriptionLength))
			.addFields([{ name: `On ${isPr ? "Pull Request" : "Issue"}`, value: `[${issue}](${event.issue.html_url})` }]);

		return embed;
	}
}
