import type {
	IssueCommentEvent,
	IssuesAssignedEvent,
	IssuesClosedEvent,
	IssuesDemilestonedEvent,
	IssuesEvent,
	IssuesMilestonedEvent,
	IssuesOpenedEvent,
	IssuesReopenedEvent,
	IssuesUnassignedEvent,
	WebhookEventName
} from "@octokit/webhooks-types";
import { EmbedLimits } from "@sapphire/discord-utilities";
import _ from "lodash";

import { EMBED_COLORS } from "@/shared/constants.js";
import { hexToRgb } from "@/shared/utils.js";
import markdownParser from "#lib/markdownParser.js";

import { BaseEmbed, type GithubEvents } from "./BaseEmbed.js";

export class IssueEmbeds extends BaseEmbed {
	public override run(event: GithubEvents, name: WebhookEventName): boolean {
		switch (name) {
			case "issue_comment":
				this.comment(event as IssueCommentEvent);
				break;
			case "issues":
				this.issues(event as IssuesEvent);
				break;
			default:
				return false;
		}

		return true;
	}

	/**
	 * Comment event embed handler
	 * @param event The Comment event data
	 * @returns
	 */
	private comment(event: IssueCommentEvent) {
		if (event.action !== "created") return;

		const isPr = Boolean(event.issue.pull_request);
		const issue = `${event.issue.title} (#${event.issue.number})`;

		this.embed
			.setTitle(`${event.repository.full_name} — ${isPr ? "Pull Request" : "Issue"} Comment Created`)
			.setURL(event.comment.html_url)
			.setDescription(markdownParser(event.comment.body).slice(0, EmbedLimits.MaximumDescriptionLength))
			.addFields([{ name: `On ${isPr ? "Pull Request" : "Issue"}`, value: `[${issue}](${event.issue.html_url})` }]);
	}

	/**
	 * Issues event embed handler
	 * @param event The Issues event data
	 * @returns
	 */
	private issues(event: IssuesEvent) {
		this.embed.setURL(event.issue.html_url);

		switch (event.action) {
			case "opened":
			case "reopened":
				this.opened(event);
				break;
			case "closed":
				this.closed(event);
				break;
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
			case "labeled":
			case "unlabeled":
			case "pinned":
			case "unpinned":
			case "deleted":
			case "edited":
			case "transferred":
			default:
				break;
		}
	}

	private opened(event: IssuesOpenedEvent | IssuesReopenedEvent) {
		this.embed
			.setTitle(`${this.embed.data.title} #${event.issue.number}`)
			.setDescription(
				[`# ${event.issue.title}\n`, markdownParser(event.issue.body ?? "")].join("\n").slice(0, EmbedLimits.MaximumDescriptionLength)
			);
	}

	private closed(event: IssuesClosedEvent) {
		this.embed
			.setTitle(`${this.embed.data.title} #${event.issue.number}`)
			.setDescription([`### ${event.issue.title}`, `State: ${event.issue.active_lock_reason ?? "closed"}`].join("\n"));
	}

	private stageChange(event: IssuesEvent) {
		const state = event.action
			.replace(/\_/g, " ")
			.trim()
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		this.embed
			.setColor(hexToRgb(EMBED_COLORS.UPDATE))
			.setTitle(`${event.repository.full_name} — Issue #${event.issue.number}: Stage Update`)
			.setDescription(`### ${event.issue.title}\nState: **${state}**`);
	}

	private assignUpdate(event: IssuesAssignedEvent | IssuesUnassignedEvent) {
		this.embed
			.setTitle(`${event.repository.full_name} — Issue #${event.issue.number}: User ${_.capitalize(event.action)}`)
			.setDescription(
				[
					`### ${event.issue.title}`,
					`Action: \`${_.capitalize(event.action)}\``,
					`Assignee: [${event.assignee?.login}](${event.assignee?.html_url})`
				].join("\n")
			);
	}

	private milestoneUpdate(event: IssuesMilestonedEvent | IssuesDemilestonedEvent) {
		this.embed
			.setTitle(`${event.repository.full_name} — Issue #${event.issue.number}`)
			.setDescription(
				[
					`### ${event.issue.title}`,
					`Action: \`${_.capitalize(event.action)}\``,
					`Milestone: [${event.milestone.title}](${event.milestone.html_url})`
				].join("\n")
			);
	}
}
