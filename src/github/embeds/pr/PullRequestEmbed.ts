import { GitHubEmbed, type GitHubEmbedOptions } from "#github/lib/embed/structures/GitHubEmbed.js";
import type {
	PullRequestAssignedEvent,
	PullRequestClosedEvent,
	PullRequestDemilestonedEvent,
	PullRequestEvent,
	PullRequestMilestonedEvent,
	PullRequestOpenedEvent,
	PullRequestReopenedEvent,
	PullRequestReviewRequestRemovedEvent,
	PullRequestReviewRequestedEvent,
	PullRequestUnassignedEvent
} from "@octokit/webhooks-types";
import type { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "#github/lib/embed/decorators.js";
import { EMBED_COLORS } from "#github/lib/types.js";
import _ from "lodash";
import { EmbedLimits } from "@sapphire/discord-utilities";

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
			case "assigned":
			case "unassigned":
				this.assignUpdate(event, embed);
				break;
			case "demilestoned":
			case "milestoned":
				this.milestoneUpdate(event, embed);
				break;
			case "review_requested":
			case "review_request_removed":
				this.reviewUpdate(event, embed);
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
		embed
			.setTitle(`${embed.data.title} #${event.pull_request.number}`)
			.setDescription(
				[`Title: **${event.pull_request.title}**\n`, `${event.pull_request.body}`].join("\n").slice(0, EmbedLimits.MaximumDescriptionLength)
			);
	}

	private closed(event: PullRequestClosedEvent, embed: EmbedBuilder) {
		embed
			.setTitle(`${embed.data.title} #${event.pull_request.number}`)
			.setDescription([`Title: **${event.pull_request.title}**`, `State: ${event.pull_request.merged ? "merged" : "closed"}`].join("\n"));
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
			.setTitle(`${event.repository.full_name} — Pull Request #${event.pull_request.number}: Stage Update`)
			.setDescription(`**${event.pull_request.title}**\nState: **${state}**`);
	}

	private assignUpdate(event: PullRequestAssignedEvent | PullRequestUnassignedEvent, embed: EmbedBuilder) {
		embed
			.setTitle(`${event.repository.full_name} — Pull Request #${event.pull_request.number}: User ${_.capitalize(event.action)}`)
			.setDescription(
				[
					`**${event.pull_request.title}**`,
					`Action: \`${_.capitalize(event.action)}\``,
					`Assignee: [${event.assignee.login}](${event.assignee.html_url})`
				].join("\n")
			);
	}

	private milestoneUpdate(event: PullRequestMilestonedEvent | PullRequestDemilestonedEvent, embed: EmbedBuilder) {
		embed
			.setTitle(`${event.repository.full_name} — Pull Request #${event.pull_request.number}`)
			.setDescription(
				[
					`**${event.pull_request.title}**`,
					`Action: \`${_.capitalize(event.action)}\``,
					`Milestone: [${event.milestone.title}](${event.milestone.html_url})`
				].join("\n")
			);
	}

	private reviewUpdate(event: PullRequestReviewRequestedEvent | PullRequestReviewRequestRemovedEvent, embed: EmbedBuilder) {
		if ("requested_reviewer" in event) {
			const action = event.action
				.replace(/\_/g, " ")
				.trim()
				.toLowerCase()
				.split(" ")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

			embed
				.setTitle(`${event.repository.full_name} — Pull Request #${event.pull_request.number}`)
				.setDescription(
					[
						`**${event.pull_request.title}**`,
						`Action: \`${action}\``,
						`Reviewer: [${event.requested_reviewer.login}](${event.requested_reviewer.html_url})`
					].join("\n")
				);
		}
	}
}
