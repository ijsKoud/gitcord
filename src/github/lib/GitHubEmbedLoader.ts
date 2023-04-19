import { Collection } from "discord.js";
import type GitCordClient from "../../lib/GitCordClient.js";
import type { GitHubEmbed } from "../structures/GitHubEmbed.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readdir } from "node:fs/promises";
import { statSync } from "node:fs";
import { underline } from "colorette";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default class GitHubEmbedLoader {
	public events = new Collection<string, GitHubEmbed>();
	public directory = join(__dirname, "..", "embeds");

	public constructor(public client: GitCordClient) {}

	/** Start the GitHub Embed creator process */
	public async init() {
		const files = await this.getFiles(this.directory);
		const count = await this.loadFiles(files);
		this.client.logger.debug(`[GitHubEmbedLoader]: ${count} files loaded`);
	}

	/**
	 * Gets all the files from a directory
	 * @param path The filepath of a directory to read
	 * @param results optional array of already processed results
	 * @returns Array of file paths
	 */
	private async getFiles(path: string, results: string[] = []) {
		const contents = await readdir(path);
		for await (const contentPath of contents) {
			// If the provided path is a folder, read out the folder
			if (statSync(join(path, contentPath)).isDirectory()) results = await this.getFiles(path, results);
			else results.push(join(path, contentPath));
		}

		return results;
	}

	/**
	 * Load the Embed creators of the provided filePaths
	 * @param filePaths The files to load
	 * @returns The amount of files which were loaded
	 */
	private async loadFiles(filePaths: string[]) {
		let count = 0;
		for await (const filePath of filePaths) {
			try {
				const { default: GitHubEmbedConstructor } = (await import(filePath)) as { default: new () => GitHubEmbed };
				const Embed = new GitHubEmbedConstructor();

				this.events.set(Embed.name, Embed);
				count++;
			} catch (err) {
				this.client.logger.error(`[GitHubEmbedLoader]: Failed to load file with path ${underline(filePath)}`);
			}
		}

		return count;
	}
}
