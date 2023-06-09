import type { WebhookEventName } from "@octokit/webhooks-types";
import { EmbedBuilder } from "discord.js";
import { ActionTypes, EMBED_COLORS } from "../types.js";

export interface GitHubEventSender {
	/** The username of the sender (e.g.: ijsKoud) */
	username: string;
	/** The display name of the sender (e.g.: Daan Klarenbeek) */
	displayName?: string;
	/** The profile url of the sender */
	profileUrl: string;
	/** The profile image url of the sender */
	profileImage: string;
}

export interface GitHubEventType {
	/** The name of the event */
	name: WebhookEventName;
	/** The action type (e.g.: created, removed, edited) */
	action?: string;
}

export interface GetBaseGitHubEmbedOptions {
	author?: GitHubEventSender;
	repository?: string;
	event: GitHubEventType;
}

export default function getBaseGitHubEmbed({ author, repository, event }: GetBaseGitHubEmbedOptions): EmbedBuilder {
	const embed = new EmbedBuilder();
	if (author) {
		const name = author.displayName ? `${author.username} (${author.displayName})` : author.username;
		embed.setAuthor({ name, iconURL: author.profileImage, url: author.profileUrl });
	}

	const eventName = `${event.name.replace(/\_/g, " ")} ${event.action ?? ""}`
		.trim()
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

	switch (event.action ?? "") {
		case ActionTypes.OPENED:
		case ActionTypes.COMPLETED:
		case ActionTypes.CREATED:
		case ActionTypes.FIXED:
			embed.setColor(EMBED_COLORS.SUCESS);
			break;
		case ActionTypes.CLOSED_BY_USER:
		case ActionTypes.CLOSED:
			embed.setColor(EMBED_COLORS.BLACK);
			break;
		case ActionTypes.DELETED:
			embed.setColor(EMBED_COLORS.FAILED);
			break;
		case ActionTypes.EDITED:
		case ActionTypes.REOPENED:
		case ActionTypes.REOPENED_BY_USER:
		case ActionTypes.REREQUESTED:
		case ActionTypes.UNASSIGNED:
		case ActionTypes.ASSIGNED:
			embed.setColor(EMBED_COLORS.UPDATE);
			break;
		default:
			embed.setColor(EMBED_COLORS.DEFAULT);
	}

	switch (event.name) {
		case "push":
			embed.setTitle(`${repository} — {commit_count} commit`);
			break;
		case "commit_comment":
			embed.setTitle(`${repository} — Commit Comment Created`);
			break;
		case "create":
			embed.setTitle(`${repository} — {type} Created`);
			break;
		case "delete":
			embed.setTitle(`${repository} — {type} Deleted`);
			embed.setColor(EMBED_COLORS.FAILED);
			break;
		default:
			embed.setTitle(`${repository} — ${eventName}`);
	}

	return embed;
}
