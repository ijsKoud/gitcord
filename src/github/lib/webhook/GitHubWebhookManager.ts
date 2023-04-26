import type GitCordClient from "#discord/lib/GitCordClient.js";
import { Webhooks } from "@octokit/webhooks";
import EventSource from "eventsource";
import type GitHubManager from "../GitHubManager.js";
import express, { type Request, type Response } from "express";
import GitCordGuildWebhook from "#database/structures/GuildWebhook.js";
import GitCordGuild from "#database/structures/Guild.js";
import { GITHUB_AVATAR_URL } from "#shared/constants.js";
import { ChannelType } from "discord.js";
import { RequestManager, RequestMethod } from "@discordjs/rest";
import BodyParser from "body-parser";

export default class GitHubWebhookManager {
	public requestManager = new RequestManager({});

	public constructor(public client: GitCordClient, public manager: GitHubManager) {}

	public init() {
		if (process.env.NODE_ENV === "development") this.initDev();
		else this.initProd();
	}

	/** Initialize development mode with Smee.io */
	private initDev() {
		const source = new EventSource(process.env.DEV_SMEE_URL!);
		let webhook: GitCordGuildWebhook;

		// Guild class cannot be initiated when client is not ready
		this.client.once("ready", () => {
			const guild = new GitCordGuild(this.client);
			guild.init({ guildId: process.env.DEV_GUILD_ID!, guildWebhooks: [] });

			webhook = new GitCordGuildWebhook(guild, {
				guildId: guild.guildId,
				repositories: [],
				type: "CHANNEL",
				webhookUrl: process.env.DEV_WEBHOOK_URL!,
				webhookSecret: process.env.GITHUB_WEBHOOK_SECRET!,
				webhookId: process.env.DEV_CHANNEL_ID!
			});
		});

		source.onmessage = async (event) => {
			const webhookEvent = JSON.parse(event.data);
			await this.receiveEvent(
				JSON.stringify(webhookEvent.body),
				webhookEvent["x-github-delivery"],
				webhookEvent["x-github-event"],
				webhookEvent["x-hub-signature"],
				webhook
			);
		};

		this.client.logger.info(`[GITHUB]: Smee.io connection ready for event listening.`);
	}

	private initProd() {
		const server = express();
		server
			.use(BodyParser.json())
			.post("/webhook/:guildId/:webhookId", this.handleRequest.bind(this))
			.get("*", (_, res) => res.redirect("https://ijskoud.dev/github/gitcord"))
			.listen(Number(process.env.PORT), () => this.client.logger.info(`[GITHUB]: Webhook server ready for event listening.`));
	}

	private async handleRequest(req: Request, res: Response) {
		const guild = this.client.databaseManager.configs.get(req.params.guildId);
		if (!guild) {
			res.status(404).send({ message: "Guild not found." });
			return;
		}

		const webhook = guild.webhooks.get(req.params.webhookId);
		if (!webhook) {
			res.status(404).send({ message: "Webhook not found." });
			return;
		}

		const deliveryHeader = req.headers["x-github-delivery"];
		const eventHeader = req.headers["x-github-event"];
		const signatureHeader = req.headers["x-hub-signature"];
		const deliveryId = Array.isArray(deliveryHeader) ? deliveryHeader[0] : deliveryHeader;
		const event = Array.isArray(eventHeader) ? eventHeader[0] : eventHeader;
		const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
		if (!event || !signature || !deliveryId) {
			res.status(400).send({ message: "Missing signature-, event- or delivery- header" });
			return;
		}

		await this.receiveEvent(JSON.stringify(req.body), deliveryId, event, signature, webhook);
		res.sendStatus(200);
	}

	/** Parses the incoming event data */
	private async receiveEvent(payload: string, deliveryId: string, name: string, signature: string, webhook: GitCordGuildWebhook) {
		const isValid = await this.verifyEvent(payload, signature, webhook.secret);
		if (!isValid) return;

		const embed = await this.manager.embedLoader.onEvent(payload, name);
		if (embed === null) return;

		let threadId: string | undefined;
		if (webhook.type === "FORUM") {
			const repository = this.manager.embedLoader.getRepository(payload);
			threadId = webhook.repositories.get(repository);

			const channel = await this.client.channels.fetch(webhook.id);
			if (!channel || channel.type !== ChannelType.GuildForum) return; // Invalid channel provided means we cannot post messages

			if (!threadId) {
				const thread =
					channel.threads.cache.find((th) => th.name === repository) ||
					(await channel.threads
						.create({
							name: repository,
							message: { content: `GitHub Notifications for **${repository}**: https://github.com/${repository}` }
						})
						.catch((err) => this.client.logger.error(`(GitHubWebhookManager): Unable to create new thread`, err)));

				if (!thread) return; // No thread created means we cannot post a message
				threadId = thread.id;
				await webhook.setRepository(repository, threadId);
			}
		}

		if (embed) {
			await webhook.discordWebhook
				.send({ embeds: [embed], avatarURL: GITHUB_AVATAR_URL, username: "GitCord", threadId })
				.catch((err) => this.client.logger.error(err));
			return;
		}

		const webhookPath = `/webhooks/${webhook.discordWebhook.id}/${webhook.discordWebhook.token}/github${
			threadId ? `?thread_id=${threadId}` : ""
		}` as const;

		await this.forwardEvent(payload, deliveryId, name, signature, webhookPath);
	}

	/** Verifies if the received event is valid and coming from GitHub */
	private async verifyEvent(payload: string, signature: string, secret: string) {
		const webhook = new Webhooks({ secret });
		const verified = await webhook.verify(payload, signature);

		return verified;
	}

	/** Forward the event data if no applicable event handler is found */
	private async forwardEvent(
		payload: string,
		deliveryId: string,
		name: string,
		signature: string,
		webhook: `/${string}/github` | `/${string}/github${string}`
	) {
		const headers = { "Content-Type": "application/json", "X-Github-Event": name, "X-Github-Delivery": deliveryId, "X-Hub-Signature": signature };
		await this.requestManager
			.setToken("null")
			.queueRequest({ method: RequestMethod.Post, fullRoute: webhook, body: JSON.parse(payload), headers });
	}
}
