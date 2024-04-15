import EventSource from "eventsource";
import fastify from "fastify";

import { env } from "@/shared/env.js";
import { HTTPStatus } from "@/shared/errors/HTTPError.js";
import { logger } from "@/shared/logger.js";
import { GithubEventHandler } from "#core/GithubEventHandler.js";

const eventHandler = new GithubEventHandler();

function setupDevelopment() {
	if (!env.SMEE_URL) throw new Error("SMEE_URL is required in development mode");

	const smee = new EventSource(env.SMEE_URL);
	smee.onmessage = (event) => eventHandler.handleSmeeRequest(event);

	logger.info("[WebhookHandler]: Listening for events via smee.io");
}

function setupProduction() {
	const app = fastify();
	app.post("/webhook/:guildId/:webhookId", eventHandler.handleFastifyRequest.bind(eventHandler));
	app.setNotFoundHandler((_, reply) => reply.redirect(HTTPStatus.PERMANENT_REDIRECT, "https://github.com/ijskoud/gitcord"));
	app.listen({ port: env.PORT, host: "0.0.0.0" }, () => logger.info(`[WebhookHandler]: Listening on port ${env.PORT}`));
}

function setupTest() {}

function setup() {
	if (env.NODE_ENV === "development") setupDevelopment();
	else if (env.NODE_ENV === "test") setupTest();
	else setupProduction();
}

setup();
