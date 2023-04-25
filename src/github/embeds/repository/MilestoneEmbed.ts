import { GitHubEmbed, type GitHubEmbedOptions } from "#github/lib/embed/structures/GitHubEmbed.js";
import type {
	MilestoneClosedEvent,
	MilestoneCreatedEvent,
	MilestoneDeletedEvent,
	MilestoneEvent,
	MilestoneOpenedEvent
} from "@octokit/webhooks-types";
import type { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "#github/lib/embed/decorators.js";
import { EmbedLimits } from "@sapphire/discord-utilities";

@ApplyOptions<GitHubEmbedOptions>({ name: "milestone" })
export default class extends GitHubEmbed {
	public override run(event: MilestoneEvent, embed: EmbedBuilder) {
		embed.setURL(event.milestone.html_url).setTitle(`${embed.data.title} #${event.milestone.number}`);

		switch (event.action) {
			case "created":
			case "opened":
				this.opened(event, embed);
				break;
			case "closed":
			case "deleted":
				this.closed(event, embed);
				break;
			case "edited":
				return null;
		}
		return embed;
	}

	private opened(event: MilestoneCreatedEvent | MilestoneOpenedEvent, embed: EmbedBuilder) {
		embed.setDescription(
			[`Milestone: **${event.milestone.title}**`, event.milestone.description].join("\n").slice(0, EmbedLimits.MaximumDescriptionLength)
		);
	}

	private closed(event: MilestoneClosedEvent | MilestoneDeletedEvent, embed: EmbedBuilder) {
		embed.setDescription(`Milestone: **${event.milestone.title}**`);
	}
}
