import type { WebhookEventName } from "@octokit/webhooks-types";
import type { GithubEvents } from "core/embeds/BaseEmbed.js";

export type GithubEventHandlerEvent = {
	payload: GithubEvents;
	name: WebhookEventName;
	deliveryId: string;
	signature: string;
};
