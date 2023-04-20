import type GitCordClient from "../../../lib/GitCordClient.js";
import { Webhooks } from "@octokit/webhooks";
import EventSource from "eventsource";
import type GitHubManager from "../GitHubManager.js";
import { WebhookClient } from "discord.js";
import express, { type Request, type Response } from "express";

export default class GitHubWebhookManager {
	public constructor(public client: GitCordClient, public manager: GitHubManager) {}

	public init() {
		if (process.env.NODE_ENV === "development") this.initDev();
		else this.initProd();
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

	private initProd() {
		const server = express();
		server.post(`/webhook/:guildId`, async (req, res) => {
			try {
				await this.handleRequest(req, res);
			} catch (err) {
				res.status(500).send({ message: "Internal server error, please try again later." });
			}
		});

		server.listen(Number(process.env.PORT), () => this.client.logger.info(`[GITHUB]: Webhook server ready for event listening.`));
	}

	private async handleRequest(req: Request<{ guildId: string }>, res: Response) {
		const guild = this.client.guilds.cache.get(req.params.guildId);
		if (!guild) {
			res.status(404).send({ message: "Guild not found." });
			return;
		}

		// TODO: get webhook from cache
		const eventHeader = req.headers["x-github-event"];
		const signatureHeader = req.headers["x-hub-signature"];
		const event = Array.isArray(eventHeader) ? eventHeader[0] : eventHeader;
		const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
		if (!event || !signature) {
			res.status(400).send({ message: "Missing signature or event header" });
			return;
		}

		await this.receiveEvent(req.body, event, signature);
	}

	/** Parse the event data and make sure it is ra */
	private async receiveEvent(payload: string, name: string, signature: string) {
		const isValid = await this.verifyEvent(payload, signature);
		if (!isValid) return;

		const embed = await this.manager.embedLoader.onEvent(payload, name);
		const webhook = new WebhookClient({
			url: process.env.DEV_WEBHOOK_URL
		});
		if (embed) await webhook.send({ embeds: [embed], threadId: "1098585806681153608" });
	}

	/** Verifies if the received event is valid and coming from GitHub */
	private async verifyEvent(payload: string, signature: string) {
		const webhook = new Webhooks({ secret: process.env.GITHUB_WEBHOOK_SECRET });
		const verified = await webhook.verify(payload, signature);

		return verified;
	}
}
