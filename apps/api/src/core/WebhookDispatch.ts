import { type InternalRequest, RequestMethod, REST } from "@discordjs/rest";

import { WEBHOOK_USER_APPENDIX } from "@/shared/constants.js";

export class WebhookDispatch {
	/** Handles the discord.js webhook requests */
	public readonly rest: REST;

	public constructor() {
		this.rest = new REST({ userAgentAppendix: WEBHOOK_USER_APPENDIX });
	}

	/**
	 * Queues a request to be sent to the Discord API
	 * @param request The request configuration
	 * @returns The api response
	 */
	public async queue(request: InternalRequest) {
		return this.rest.setToken("null").queueRequest(request);
	}

	/**
	 * Sends a POST request to the Discord API
	 * @param webhook The correct webhook path
	 * @param body The data to send to the API
	 * @param headers The headers to send to the API
	 * @returns
	 */
	public async post(webhook: `/${string}`, body: any, headers: Record<string, string> = {}) {
		return this.queue({ fullRoute: webhook, method: RequestMethod.Post, body, headers });
	}
}
