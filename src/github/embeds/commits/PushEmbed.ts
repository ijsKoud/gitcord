import { GitHubEmbed, type GitHubEmbedOptions } from "#github/lib/embed/structures/GitHubEmbed.js";
import type { PushEvent } from "@octokit/webhooks-types";
import type { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "#github/lib/embed/decorators.js";
import { EMBED_COLORS } from "#github/lib/types.js";

@ApplyOptions<GitHubEmbedOptions>({ name: "push" })
export default class extends GitHubEmbed {
	public override run(event: PushEvent, embed: EmbedBuilder) {
		const [, _type, ..._id] = event.ref.split(/\//g);
		const type = _type === "tags" ? "tag" : "branch";
		const id = _id.join("/");

		const refUrl = `${event.repository.svn_url}/tree/${id}`;
		const commits = event.commits.map(
			(commit) =>
				`[\`${commit.id.slice(0, 7)}\`](${commit.url}) ${commit.message.split("\n")[0]} - ${commit.author.username || commit.author.name}`
		);

		embed.setDescription(commits.join("\n").slice(0, 4096) || null);
		embed.addFields({ name: `On ${type}`, value: `[${id}](${refUrl})`.slice(0, 1024) });

		const updatedTitle = embed.data.title!.replace(`{commit_count}`, commits.length.toString());
		embed.setTitle(`${updatedTitle}${commits.length === 1 ? "" : "s"} ${event.forced ? `(forced)` : ""}`.trim());

		if (event.forced) embed.setColor(EMBED_COLORS.FAILED);

		return embed;
	}
}
