import { GitHubEmbed, type GitHubEmbedOptions } from "#github/lib/embed/structures/GitHubEmbed.js";
import type { PullRequestEvent, PullRequestOpenedEvent, PullRequestReopenedEvent } from "@octokit/webhooks-types";
import type { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "#github/lib/embed/decorators.js";

@ApplyOptions<GitHubEmbedOptions>({ name: "pull_request" })
export default class extends GitHubEmbed {
	public override run(event: PullRequestEvent, embed: EmbedBuilder) {
		const updatedTitle = `${embed.data.title} ${event.action}`;
		embed.setTitle(updatedTitle);

		switch (event.action) {
			case "opened":
			case "reopened":
				this.opened(event, embed);
				break;
			default:
				break;
		}

		return embed;
	}

	private opened(event: PullRequestOpenedEvent | PullRequestReopenedEvent, embed: EmbedBuilder) {
		embed.setDescription([`Title: **${event.pull_request.title}`, `${event.pull_request.body}`].join("\n").slice(0, 4096));
	}
}
