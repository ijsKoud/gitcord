import type GitCordClient from "../../../lib/GitCordClient.js";
import { Webhooks } from "@octokit/webhooks";
import EventSource from "eventsource";

export default class GitHubWebhookManager {
	public constructor(public client: GitCordClient) {}

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
				webhookEvent["x-github-delivery"],
				webhookEvent["x-github-event"],
				webhookEvent["x-hub-signature"]
			);
		};

		this.client.logger.info(`[GITHUB]: Smee.io connection ready for event listening.`);
	}

	/** Parse the event data and make sure it is ra */
	private async receiveEvent(payload: string, id: string, name: string, signature: string) {
		const webhook = new Webhooks({ secret: process.env.GITHUB_WEBHOOK_SECRET });
		const verified = await webhook.verify(payload, signature);
		if (!verified) return null;

		return null;
	}
}
