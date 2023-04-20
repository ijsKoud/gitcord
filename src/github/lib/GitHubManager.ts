import type GitCordClient from "../../lib/GitCordClient.js";
import GitHubEmbedLoader from "./embed/GitHubEmbedLoader.js";
import GitHubWebhookManager from "./webhook/GitHubWebhookManager.js";

export default class GitHubManager {
	public webhookManager: GitHubWebhookManager;
	public embedLoader: GitHubEmbedLoader;

	public constructor(public client: GitCordClient) {
		this.webhookManager = new GitHubWebhookManager(client);
		this.embedLoader = new GitHubEmbedLoader(client);
	}

	public async init() {
		this.webhookManager.init();
		await this.embedLoader.init();
	}
}
