import { GitHubEmbed, type GitHubEmbedOptions } from "#github/lib/embed/structures/GitHubEmbed.js";
import type { PackageEvent } from "@octokit/webhooks-types";
import type { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "#github/lib/embed/decorators.js";
import { EmbedLimits } from "@sapphire/discord-utilities";

@ApplyOptions<GitHubEmbedOptions>({ name: "package" })
export default class extends GitHubEmbed {
	public override run(event: PackageEvent, embed: EmbedBuilder) {
		if (event.action !== "published") return null;
		embed
			.setURL(event.package.html_url)
			.setDescription(
				[`Package: **${event.package.name}**`, event.package.description ?? ""].join("\n").slice(0, EmbedLimits.MaximumDescriptionLength)
			);

		return embed;
	}
}
