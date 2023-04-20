import { GitHubEmbed, type GitHubEmbedOptions } from "../lib/embed/structures/GitHubEmbed.js";
import type { PushEvent } from "@octokit/webhooks-types";
import type { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "../lib/embed/decorators.js";

@ApplyOptions<GitHubEmbedOptions>({ name: "push" })
export default class extends GitHubEmbed {
	public override run(event: PushEvent, embed: EmbedBuilder) {
		const [, _type, ..._id] = event.ref.split(/\//g);
		const type = _type === "tags" ? "tag" : "branch";
		const id = _id.join("/");

		const refUrl = `${event.repository.svn_url}/tree/${id}`;
		const commits = event.commits.map(
			(commit) => `[\`${commit.id.slice(0, 7)}\`](${commit.url}) ${commit.message} - ${commit.author.username || commit.author.name}`
		);

		embed.setDescription(commits.join("\n").slice(0, 4096));
		embed.addFields({ name: `On ${type}`, value: `[${id}](${refUrl})`.slice(0, 1024) });

		return embed;
	}
}
