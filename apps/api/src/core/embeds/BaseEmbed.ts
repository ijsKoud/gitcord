import { EmbedBuilder } from "@discordjs/builders";
import type { EventPayloadMap, User, WebhookEventName } from "@octokit/webhooks-types";

import { ActionTypes, EMBED_COLORS, UserTypes } from "@/shared/constants.js";
import type { GitHubEventSender } from "@/shared/types.js";
import { hexToRgb } from "@/shared/utils.js";

export abstract class BaseEmbed {
	public readonly embed: EmbedBuilder;

	public constructor() {
		this.embed = BaseEmbed.getBaseEmbed();
	}

	public generate(event: GithubEvents, name: WebhookEventName): ReturnType<EmbedBuilder["toJSON"]> | null {
		this.fill(event, name);

		const result = this.run(event, name);
		if (!result) return null;

		return this.embed.toJSON();
	}

	protected abstract run(event: GithubEvents, name: WebhookEventName): boolean;

	private fill(event: GithubEvents, name: WebhookEventName) {
		const { author, repository } = this.getEventDetails(event);
		if (author) {
			const name = author.displayName ? `${author.username} (${author.displayName})` : author.username;
			this.embed.setAuthor({ name, iconURL: author.profileImage, url: author.profileUrl });
		}

		const action = "action" in event ? event.action : "";
		const eventName = `${name.replace(/\_/g, " ")} ${action}`
			.trim()
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		switch (action) {
			case ActionTypes.OPENED:
			case ActionTypes.COMPLETED:
			case ActionTypes.CREATED:
			case ActionTypes.FIXED:
				this.embed.setColor(hexToRgb(EMBED_COLORS.SUCESS));
				break;
			case ActionTypes.CLOSED_BY_USER:
			case ActionTypes.CLOSED:
				this.embed.setColor(hexToRgb(EMBED_COLORS.BLACK));
				break;
			case ActionTypes.DELETED:
				this.embed.setColor(hexToRgb(EMBED_COLORS.FAILED));
				break;
			case ActionTypes.EDITED:
			case ActionTypes.REOPENED:
			case ActionTypes.REOPENED_BY_USER:
			case ActionTypes.REREQUESTED:
			case ActionTypes.UNASSIGNED:
			case ActionTypes.ASSIGNED:
				this.embed.setColor(hexToRgb(EMBED_COLORS.UPDATE));
				break;
			default:
				this.embed.setColor(hexToRgb(EMBED_COLORS.DEFAULT));
		}

		switch (name) {
			case "push":
				this.embed.setTitle(`${repository} — {commit_count} commit`);
				break;
			case "commit_comment":
				this.embed.setTitle(`${repository} — Commit Comment Created`);
				break;
			case "create":
				this.embed.setTitle(`${repository} — {type} Created`);
				break;
			case "delete":
				this.embed.setTitle(`${repository} — {type} Deleted`);
				this.embed.setColor(hexToRgb(EMBED_COLORS.FAILED));
				break;
			default:
				this.embed.setTitle(`${repository} — ${eventName}`);
		}
	}

	private getEventDetails(event: GithubEvents) {
		let author: GitHubEventSender | undefined = undefined;
		let repository = "";

		if ("sender" in event) {
			switch (event.sender?.type) {
				case UserTypes.USER:
					{
						const sender = event.sender as User;
						author = {
							username: sender.login,
							displayName: sender.name,
							profileImage: sender.avatar_url,
							profileUrl: sender.html_url
						};
					}
					break;
				default:
					author = {
						username: event.sender?.login ?? "",
						profileImage: event.sender?.avatar_url ?? "",
						profileUrl: event.sender?.html_url ?? ""
					};
			}
		}

		// Assign repository name and otherwise name of organization
		if ("repository" in event && typeof event.repository !== "undefined") repository = event.repository.full_name;
		else if ("organization" in event && typeof event.organization !== "undefined") repository = event.organization.login;

		return { author, repository };
	}

	public static getBaseEmbed() {
		return new EmbedBuilder();
	}
}

export type GithubEvents = EventPayloadMap[keyof EventPayloadMap];
