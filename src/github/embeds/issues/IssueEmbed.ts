import { GitHubEmbed, type GitHubEmbedOptions } from "#github/lib/embed/structures/GitHubEmbed.js";
import type {
	IssuesAssignedEvent,
	IssuesClosedEvent,
	IssuesDemilestonedEvent,
	IssuesEvent,
	IssuesMilestonedEvent,
	IssuesOpenedEvent,
	IssuesReopenedEvent,
	IssuesUnassignedEvent
} from "@octokit/webhooks-types";
import type { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "#github/lib/embed/decorators.js";
import { EMBED_COLORS } from "#github/lib/types.js";
import _ from "lodash";
import { EmbedLimits } from "@sapphire/discord-utilities";

@ApplyOptions<GitHubEmbedOptions>({ name: "issues" })
export default class extends GitHubEmbed {
	public override run(event: IssuesEvent, embed: EmbedBuilder) {
		embed.setURL(event.issue.html_url);

		switch (event.action) {
			case "opened":
			case "reopened":
				this.opened(event, embed);
				break;
			case "closed":
				this.closed(event, embed);
				break;
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
			case "labeled":
			case "unlabeled":
			case "pinned":
			case "unpinned":
			case "deleted":
			case "edited":
			case "transferred":
				return null;
			default:
				break;
		}

		return embed;
	}

	private opened(event: IssuesOpenedEvent | IssuesReopenedEvent, embed: EmbedBuilder) {
		embed
			.setTitle(`${embed.data.title} #${event.issue.number}`)
			.setDescription([`Title: **${event.issue.title}**\n`, `${event.issue.body}`].join("\n").slice(0, EmbedLimits.MaximumDescriptionLength));
	}

	private closed(event: IssuesClosedEvent, embed: EmbedBuilder) {
		embed
			.setTitle(`${embed.data.title} #${event.issue.number}`)
			.setDescription([`Title: **${event.issue.title}**`, `State: ${event.issue.active_lock_reason ?? "closed"}`].join("\n"));
	}

	private stageChange(event: IssuesEvent, embed: EmbedBuilder) {
		const state = event.action
			.replace(/\_/g, " ")
			.trim()
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		embed
			.setColor(EMBED_COLORS.UPDATE)
			.setTitle(`${event.repository.full_name} — Issue #${event.issue.number}: Stage Update`)
			.setDescription(`**${event.issue.title}**\nState: **${state}**`);
	}

	private assignUpdate(event: IssuesAssignedEvent | IssuesUnassignedEvent, embed: EmbedBuilder) {
		embed
			.setTitle(`${event.repository.full_name} — Issue #${event.issue.number}: User ${_.capitalize(event.action)}`)
			.setDescription(
				[
					`**${event.issue.title}**`,
					`Action: \`${_.capitalize(event.action)}\``,
					`Assignee: [${event.assignee?.login}](${event.assignee?.html_url})`
				].join("\n")
			);
	}

	private milestoneUpdate(event: IssuesMilestonedEvent | IssuesDemilestonedEvent, embed: EmbedBuilder) {
		embed
			.setTitle(`${event.repository.full_name} — Issue #${event.issue.number}`)
			.setDescription(
				[
					`**${event.issue.title}**`,
					`Action: \`${_.capitalize(event.action)}\``,
					`Milestone: [${event.milestone.title}](${event.milestone.html_url})`
				].join("\n")
			);
	}
}
