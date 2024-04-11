import type { MemberEvent, MilestoneEvent, PackageEvent, ReleaseEvent, WebhookEventName } from "@octokit/webhooks-types";
import { EmbedLimits } from "@sapphire/discord-utilities";

import markdownParser from "#lib/markdownParser.js";

import { BaseEmbed, type GithubEvents } from "./BaseEmbed.js";

export class RepositoryEmbeds extends BaseEmbed {
	public override run(event: GithubEvents, name: WebhookEventName): boolean {
		switch (name) {
			case "release":
				this.release(event as ReleaseEvent);
				break;
			case "package":
				this.package(event as PackageEvent);
				break;
			case "member":
				this.collaborator(event as MemberEvent);
				break;
			case "milestone":
				this.milestone(event as MilestoneEvent);
				break;
			default:
				return false;
		}

		return true;
	}

	/**
	 * Release event embed handler
	 * @param event The release event data
	 * @returns
	 */
	private release(event: ReleaseEvent) {
		if (!["prereleased", "released"].includes(event.action)) return;

		this.embed
			.setTitle(`${event.repository.full_name} — Release ${event.release.prerelease ? "Prereleased" : "Published"}: ${event.release.name}`)
			.setDescription(markdownParser(event.release.body.slice(0, EmbedLimits.MaximumDescriptionLength)));
	}

	/**
	 * Package event embed handler
	 * @param event The package event data
	 * @returns
	 */
	private package(event: PackageEvent) {
		if (event.action !== "published") return;
		const registry = event.package.package_type === "CONTAINER" ? "ghcr.io" : event.package.package_type;

		this.embed
			.setURL(event.package.html_url)
			.setDescription(
				[`Package: **${event.package.name}**`, `Registry: \`${registry}\``, event.package.description ?? ""]
					.join("\n")
					.slice(0, EmbedLimits.MaximumDescriptionLength)
			);
	}

	/**
	 * Collaborator event embed handler
	 * @param event The Collaborator Event
	 */
	private collaborator(event: MemberEvent) {
		const updatedTitle = this.embed.data.title!.replace("Member", "Collaborator");
		this.embed.setTitle(updatedTitle).setDescription(`Collaborator: [${event.member.login}](${event.member.html_url})`);
	}

	/**
	 * Milestone event embed handler
	 * @param event The Milestone Event
	 */
	private milestone(event: MilestoneEvent) {
		this.embed.setURL(event.milestone.html_url).setTitle(`${this.embed.data.title} #${event.milestone.number}`);

		switch (event.action) {
			case "created":
			case "opened":
				this.embed.setDescription(
					[`Milestone: **${event.milestone.title}**`, event.milestone.description].join("\n").slice(0, EmbedLimits.MaximumDescriptionLength)
				);
				break;
			case "closed":
			case "deleted":
				this.embed.setDescription(`Milestone: **${event.milestone.title}**`);
				break;
			case "edited":
				break;
		}
	}
}
