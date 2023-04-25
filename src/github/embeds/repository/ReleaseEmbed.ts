import { GitHubEmbed, type GitHubEmbedOptions } from "#github/lib/embed/structures/GitHubEmbed.js";
import type { ReleaseEvent, ReleasePrereleasedEvent, ReleasePublishedEvent, ReleaseReleasedEvent } from "@octokit/webhooks-types";
import type { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "#github/lib/embed/decorators.js";
import { EmbedLimits } from "@sapphire/discord-utilities";

@ApplyOptions<GitHubEmbedOptions>({ name: "release" })
export default class extends GitHubEmbed {
	public override run(event: ReleaseEvent, embed: EmbedBuilder) {
		embed.setURL(event.release.html_url);
		switch (event.action) {
			case "released":
			case "prereleased":
				this.published(event, embed);
				break;
			case "created":
			case "published":
			case "edited":
			case "unpublished":
			case "deleted":
				return null;
		}

		return embed;
	}

	private published(event: ReleasePublishedEvent | ReleaseReleasedEvent | ReleasePrereleasedEvent, embed: EmbedBuilder) {
		embed
			.setTitle(`${event.repository.full_name} — Release ${event.release.prerelease ? "Prereleased" : "Published"}: ${event.release.name}`)
			.setDescription(event.release.body.slice(0, EmbedLimits.MaximumDescriptionLength));
	}
}
