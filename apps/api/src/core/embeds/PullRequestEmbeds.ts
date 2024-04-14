import type {
	PullRequestAssignedEvent,
	PullRequestClosedEvent,
	PullRequestDemilestonedEvent,
	PullRequestEvent,
	PullRequestMilestonedEvent,
	PullRequestOpenedEvent,
	PullRequestReopenedEvent,
	PullRequestReviewRequestedEvent,
	PullRequestReviewRequestRemovedEvent,
	PullRequestUnassignedEvent,
	WebhookEventName
} from "@octokit/webhooks-types";
import { EmbedLimits } from "@sapphire/discord-utilities";
import _ from "lodash";

import { EMBED_COLORS } from "@/shared/constants.js";
import { hexToRgb } from "@/shared/utils.js";
import markdownParser from "#lib/markdownParser.js";

import { BaseEmbed } from "./BaseEmbed.js";

export class PullRequestEmbeds extends BaseEmbed {
	public override run(event: PullRequestEvent, name: WebhookEventName): boolean {
		this.embed.setURL(event.pull_request.html_url);

		switch (event.action) {
			case "opened":
			case "reopened":
				this.opened(event);
				break;
			case "closed":
				this.closed(event);
				break;
			case "converted_to_draft":
			case "ready_for_review":
			case "locked":
			case "unlocked":
				this.stageChange(event);
				break;
			case "assigned":
			case "unassigned":
				this.assignUpdate(event);
				break;
			case "demilestoned":
			case "milestoned":
				this.milestoneUpdate(event);
				break;
			case "review_requested":
			case "review_request_removed":
				this.reviewUpdate(event);
				break;
			case "auto_merge_disabled":
			case "auto_merge_enabled":
			case "enqueued":
			case "synchronize":
			case "edited":
			case "dequeued":
			case "labeled":
			case "unlabeled":
			default:
				return false;
		}

		return true;
	}

	private opened(event: PullRequestOpenedEvent | PullRequestReopenedEvent) {
		this.embed
			.setTitle(`${this.embed.data.title} #${event.pull_request.number}`)
			.setDescription(
				[`# ${event.pull_request.title}\n`, markdownParser(event.pull_request.body ?? "")]
					.join("\n")
					.slice(0, EmbedLimits.MaximumDescriptionLength)
			);
	}

	private closed(event: PullRequestClosedEvent) {
		this.embed
			.setTitle(`${this.embed.data.title} #${event.pull_request.number}`)
			.setDescription([`# ${event.pull_request.title}`, `State: \`${event.pull_request.merged ? "merged" : "closed"}\``].join("\n"));
	}

	private stageChange(event: PullRequestEvent) {
		const state = event.action
			.replace(/\_/g, " ")
			.trim()
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		this.embed
			.setColor(hexToRgb(EMBED_COLORS.UPDATE))
			.setTitle(`${event.repository.full_name} — Pull Request #${event.pull_request.number}: Stage Update`)
			.setDescription(`### ${event.pull_request.title}\nState: \`${state}\``);
	}

	private assignUpdate(event: PullRequestAssignedEvent | PullRequestUnassignedEvent) {
		this.embed
			.setTitle(`${event.repository.full_name} — Pull Request #${event.pull_request.number}: User ${_.capitalize(event.action)}`)
			.setDescription([`### ${event.pull_request.title}`, `Assignee: [${event.assignee.login}](${event.assignee.html_url})`].join("\n"));
	}

	private milestoneUpdate(event: PullRequestMilestonedEvent | PullRequestDemilestonedEvent) {
		this.embed
			.setTitle(`${event.repository.full_name} — Pull Request #${event.pull_request.number}: ${_.capitalize(event.action)}`)
			.setDescription([`### ${event.pull_request.title}`, `Milestone: [${event.milestone.title}](${event.milestone.html_url})`].join("\n"));
	}

	private reviewUpdate(event: PullRequestReviewRequestedEvent | PullRequestReviewRequestRemovedEvent) {
		if ("requested_reviewer" in event) {
			const action = event.action
				.replace(/\_/g, " ")
				.trim()
				.toLowerCase()
				.split(" ")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

			this.embed
				.setTitle(`${event.repository.full_name} — Pull Request #${event.pull_request.number}: ${action}`)
				.setDescription(
					[`### ${event.pull_request.title}`, `Reviewer: [${event.requested_reviewer.login}](${event.requested_reviewer.html_url})`].join(
						"\n"
					)
				);
		}
	}
}
