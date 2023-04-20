import type GitCordClient from "../../../lib/GitCordClient.js";
import { Webhooks } from "@octokit/webhooks";
import EventSource from "eventsource";
import type GitHubManager from "../GitHubManager.js";
import { WebhookClient } from "discord.js";

export default class GitHubWebhookManager {
	public constructor(public client: GitCordClient, public manager: GitHubManager) {}

	public init() {
		if (process.env.NODE_ENV === "development") this.initDev();
	}

	/** Initialize development mode with Smee.io */
	private initDev() {
		const source = new EventSource(process.env.DEV_SMEE_URL);
		source.onmessage = async (event) => {
			const webhookEvent = JSON.parse(event.data);
			await this.receiveEvent(
				JSON.stringify(webhookEvent.body),
				// webhookEvent["x-github-delivery"],
				webhookEvent["x-github-event"],
				webhookEvent["x-hub-signature"]
			);
		};

		this.client.logger.info(`[GITHUB]: Smee.io connection ready for event listening.`);
	}

	/** Parse the event data and make sure it is ra */
	private async receiveEvent(payload: string, name: string, signature: string) {
		const isValid = await this.verifyEvent(payload, signature);
		if (!isValid) return;

		const embed = await this.manager.embedLoader.onEvent(payload, name);
		const webhook = new WebhookClient({
			url: process.env.DEV_WEBHOOK_URL
		});
		if (embed) await webhook.send({ embeds: [embed] });
	}

	/** Verifies if the received event is valid and coming from GitHub */
	private async verifyEvent(payload: string, signature: string) {
		const webhook = new Webhooks({ secret: process.env.GITHUB_WEBHOOK_SECRET });
		const verified = await webhook.verify(payload, signature);

		return verified;
	}
}
