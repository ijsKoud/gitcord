import type { WebhookEventName } from "@octokit/webhooks-types";
import { createHmac, timingSafeEqual } from "crypto";
import { type FastifyReply, type FastifyRequest } from "fastify";

import { GITHUB_AVATAR_URL } from "@/shared/constants.js";
import { env } from "@/shared/env.js";
import { HTTPError, HTTPStatus } from "@/shared/errors/HTTPError.js";
import { logger } from "@/shared/logger.js";
import { getRepository } from "@/shared/utils.js";
import type { GithubEventHandlerEvent } from "#lib/types.js";

import { DiscordChannelManager } from "./DiscordChannelManager.js";
import type { GithubEvents } from "./embeds/BaseEmbed.js";
import { getEmbed } from "./embeds/index.js";
import { WebhookDispatch } from "./WebhookDispatch.js";

export class GithubEventHandler {
	public readonly dispatch: WebhookDispatch;
	public readonly channelManager: DiscordChannelManager;

	public constructor() {
		this.dispatch = new WebhookDispatch();
		this.channelManager = new DiscordChannelManager();
	}

	public async handleFastifyRequest(req: GithubEventHandlerRequest, reply: FastifyReply) {
		const { guildId, webhookId } = req.params;
		if (!guildId || !webhookId) await Promise.reject(new HTTPError(HTTPStatus.BAD_REQUEST, "Missing guild id in request params"));

		const deliveryHeader = req.headers["x-github-delivery"];
		const eventHeader = req.headers["x-github-event"];
		const signatureHeader = req.headers["x-hub-signature-256"];
		const deliveryId = Array.isArray(deliveryHeader) ? deliveryHeader[0] : deliveryHeader;
		const event = Array.isArray(eventHeader) ? eventHeader[0] : eventHeader;
		const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
		if (!deliveryId || !event || !signature) return Promise.reject(new HTTPError(HTTPStatus.BAD_REQUEST, "Missing headers in request"));

		try {
			const repository = getRepository(req.body);
			const webhook = await this.channelManager.getWebhook(guildId, webhookId, repository);

			await this.receiveEvent({ payload: req.body, signature, deliveryId, name: event }, webhook.url, webhook.secret);
			await reply.status(HTTPStatus.NO_CONTENT).send();
		} catch (error) {
			if (error instanceof HTTPError) {
				await reply.status(error.status).send({ errors: [error.toJSON()] });
				return;
			}

			logger.error(`[GitHubEventHandler#handleFastifyRequest()]: `, error);
			await reply
				.status(HTTPStatus.INTERNAL_SERVER_ERROR)
				.send({ errors: [new HTTPError(HTTPStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred").toJSON()] });
		}
	}

	public async handleSmeeRequest(event: MessageEvent<any>) {
		const guildId = env.DEVELOPMENT_GUILD_ID;
		const webhookId = env.DEVELOPMENT_WEBHOOK_ID;
		const secret = env.WEBHOOK_SECRET;
		if (!guildId) throw new Error("Missing guild id in environment variables");
		if (!webhookId) throw new Error("Missing webhook id in environment variables");
		if (!secret) throw new Error("Missing webhook secret in environment variables");

		const webhookEvent = JSON.parse(event.data);
		const configuration = {
			payload: webhookEvent.body,
			deliveryId: webhookEvent["x-github-delivery"],
			name: webhookEvent["x-github-event"],
			signature: webhookEvent["x-hub-signature-256"]
		};

		try {
			const repository = getRepository(webhookEvent.body);
			const webhook = await this.channelManager.getWebhook(guildId, webhookId, repository);
			await this.receiveEvent(configuration, webhook.url, secret);
		} catch (error) {
			if (error instanceof HTTPError) return; // HTTP errors are not caused by bugs in code
			logger.error(`[GitHubEventHandler#handleSmeeRequest()]: `, error);
		}
	}

	/**
	 * Receives an event from a Github webhook and dispatches it to the appropriate Discord webhook
	 * @param event	The event received from the Github webhook
	 * @param guild	The guild to dispatch the event to
	 * @param secret The secret to verify the signature
	 * @returns
	 */
	public async receiveEvent(event: GithubEventHandlerEvent, webhook: string, secret: string) {
		const isValid = this.verifySignature(JSON.stringify(event.payload), event.signature, secret);
		if (!isValid) return Promise.reject(new HTTPError(HTTPStatus.UNAUTHORIZED, "Invalid signature"));

		const embed = getEmbed(event.payload, event.name);
		if (!embed) return this.forwardEvent(event, webhook);

		const body = { embeds: [embed], avatar_url: GITHUB_AVATAR_URL, username: "GitCord" };
		webhook = webhook.split("/").reverse().slice(0, 3).reverse().join("/");
		await this.dispatch.post(`/${webhook}` as `/${string}`, body);
	}

	/**
	 * Verifies the signature of an incoming webhook request
	 * @param payload The payload received from the webhook request
	 * @param signature The signature received from the webhook request
	 * @param secret The secret to verify the signature
	 * @returns A boolean indicating if the signature is valid
	 */
	public verifySignature(payload: string, signature: string, secret: string) {
		try {
			// TODO: change env.WEBHOOK_SCERET to variable from database
			const verificationSignature = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
			const trusted = Buffer.from(verificationSignature, "ascii");
			const untrusted = Buffer.from(signature, "ascii");

			if (trusted.length !== untrusted.length) return false;
			return timingSafeEqual(untrusted, trusted);
		} catch (error) {
			logger.error(`[GitHubEventHandler#verifySignature()]: `, error);
			return false;
		}
	}

	/**
	 * 	Forwards the event to the discord webhook api
	 * @param event The github event data
	 * @param webhook The webhook to post to
	 */
	public async forwardEvent(event: GithubEventHandlerEvent, webhook: string) {
		const url = new URL(webhook);
		url.pathname += "/github";

		const path = url.toString().split("/").reverse().slice(0, 4).reverse().join("/");
		await this.dispatch.post(`/${path}` as `/${string}`, event.payload, {
			"x-github-delivery": event.deliveryId,
			"x-github-event": event.name,
			"x-hub-signature-256": event.signature
		});
	}
}

export type GithubEventHandlerRequest = FastifyRequest<{
	Params: { guildId: string; webhookId: string };
	Body: GithubEvents;
	Headers: {
		"x-github-delivery": string | string[];
		"x-github-event": WebhookEventName | WebhookEventName[];
		"x-hub-signature-256": string | string[];
	};
}>;
