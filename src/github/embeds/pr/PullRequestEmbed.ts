import { GitHubEmbed, type GitHubEmbedOptions } from "#github/lib/embed/structures/GitHubEmbed.js";
import type { PullRequestClosedEvent, PullRequestEvent, PullRequestOpenedEvent, PullRequestReopenedEvent } from "@octokit/webhooks-types";
import type { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "#github/lib/embed/decorators.js";
import { EMBED_COLORS } from "#github/lib/types.js";

@ApplyOptions<GitHubEmbedOptions>({ name: "pull_request" })
export default class extends GitHubEmbed {
	public override run(event: PullRequestEvent, embed: EmbedBuilder) {
		embed.setURL(event.pull_request.html_url);

		switch (event.action) {
			case "opened":
			case "reopened":
				this.opened(event, embed);
				break;
			case "closed":
				this.closed(event, embed);
				break;
			case "converted_to_draft":
			case "ready_for_review":
			case "locked":
			case "unlocked":
				this.stageChange(event, embed);
				break;
			case "auto_merge_disabled":
			case "auto_merge_enabled":
			case "queued":
			case "synchronize":
			case "edited":
			case "dequeued":
			case "labeled":
			case "unlabeled":
				return null;
			default:
				break;
		}

		return embed;
	}

	private opened(event: PullRequestOpenedEvent | PullRequestReopenedEvent, embed: EmbedBuilder) {
		embed.setDescription([`Title: **${event.pull_request.title}**\n`, `${event.pull_request.body}`].join("\n").slice(0, 4096));
	}

	private closed(event: PullRequestClosedEvent, embed: EmbedBuilder) {
		embed.setDescription([`Title: **${event.pull_request.title}**`, `State: ${event.pull_request.merged ? "merged" : "closed"}`].join("\n"));
	}

	private stageChange(event: PullRequestEvent, embed: EmbedBuilder) {
		const state = event.action
			.replace(/\_/g, " ")
			.trim()
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		embed
			.setColor(EMBED_COLORS.UPDATE)
			.setTitle(`${event.repository.full_name} — ${event.pull_request.title}`)
			.setDescription(`State: **${state}**`);
	}
}
