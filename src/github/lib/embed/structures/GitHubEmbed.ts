import type { User, WebhookEvent, WebhookEventName } from "@octokit/webhooks-types";
import { Logger } from "@snowcrystals/icicle";
import type { EmbedBuilder } from "discord.js";
import getBaseGitHubEmbed, { type GitHubEventSender, type GitHubEventType } from "../BaseGitHubEmbed.js";
import { BLOCKED_EVENTS, UserTypes, type WebhookEvents } from "../../types.js";

export class GitHubEmbed implements GitHubEmbedOptions {
	public name: WebhookEventName;
	public logger = new Logger();

	public constructor(options: GitHubEmbedOptions) {
		this.name = options.name;
	}

	/**
	 * The function which run process the incoming webhook data
	 * @param event WebhookEvent: The event coming from GitHub
	 * @param embed EmbedBuilder: Embed with default populated data (like author, title, color)
	 * @returns Promise\<EmbedBuilder\> | EmbedBuilder
	 */
	public run(event: WebhookEvent, embed: EmbedBuilder): Promise<EmbedBuilder | null> | EmbedBuilder | null {
		this.logger.error(`${this.name}: GitHubEmbed does not have a valid run function.`);
		return embed;
	}

	public _run(event: WebhookEvents) {
		// Block events which aren't applicable for webhooks
		if (BLOCKED_EVENTS.includes(this.name)) return null;

		let author: GitHubEventSender | undefined = undefined;
		let repository = "";

		if ("sender" in event) {
			switch (event.sender.type) {
				case UserTypes.USER:
					{
						const sender = event.sender as User;
						author = {
							username: sender.login,
							displayName: sender.name,
							profileImage: sender.avatar_url,
							profileUrl: sender.url
						};
					}
					break;
				default:
					author = {
						username: event.sender.login,
						profileImage: event.sender.avatar_url,
						profileUrl: event.sender.url
					};
			}
		}

		// Assign repository name and otherwise name of organization
		if ("repository" in event && typeof event.repository !== "undefined") repository = event.repository.full_name;
		else if ("organization" in event && typeof event.organization !== "undefined") repository = event.organization.login;

		const eventType: GitHubEventType = {
			name: this.name,
			action: "action" in event ? event.action : undefined
		};

		const embed = getBaseGitHubEmbed({ author, repository, event: eventType });
		return this.run(event, embed);
	}
}

export interface GitHubEmbedOptions {
	/** The name of the event you are listening to */
	name: WebhookEventName;
}
