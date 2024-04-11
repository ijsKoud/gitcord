import type { CommitCommentEvent, PushEvent, WebhookEventName } from "@octokit/webhooks-types";
import { EmbedLimits } from "@sapphire/discord-utilities";

import { EMBED_COLORS } from "@/shared/constants.js";
import { HTTPError, HTTPStatus } from "@/shared/errors/HTTPError.js";
import { hexToRgb } from "@/shared/utils.js";
import markdownParser from "#lib/markdownParser.js";

import { BaseEmbed, type GithubEvents } from "./BaseEmbed.js";

export class CommitEmbeds extends BaseEmbed {
	public override run(event: GithubEvents, name: WebhookEventName): boolean {
		switch (name) {
			case "push":
				this.push(event as PushEvent);
				break;
			case "commit_comment":
				this.comment(event as CommitCommentEvent);
				break;
			default:
				return false;
		}

		return true;
	}

	/**
	 * Push event embed handler
	 * @param event The push event data
	 * @returns
	 */
	private push(event: PushEvent) {
		if (!event.commits.length) throw new HTTPError(HTTPStatus.BAD_REQUEST, "No commits in push event");

		const [, _type, ..._id] = event.ref.split(/\//g);
		const type = _type === "tags" ? "tag" : "branch";
		const id = _id.join("/");

		const refUrl = `${event.repository.svn_url}/tree/${id}`;
		const commits = event.commits.map(
			(commit) =>
				`[\`${commit.id.slice(0, 7)}\`](${commit.url}) ${commit.message.split("\n")[0]} - ${commit.author.username || commit.author.name}`
		);

		this.embed.setDescription(commits.join("\n").slice(0, 4096));
		this.embed.addFields({ name: `On ${type}`, value: `[${id}](${refUrl})`.slice(0, EmbedLimits.MaximumFieldValueLength) });

		const updatedTitle = this.embed.data.title!.replace(`{commit_count}`, commits.length.toString());
		this.embed.setTitle(`${updatedTitle}${commits.length === 1 ? "" : "s"} ${event.forced ? `(forced)` : ""}`.trim());

		if (event.forced) this.embed.setColor(hexToRgb(EMBED_COLORS.FAILED));
	}

	private comment(event: CommitCommentEvent) {
		const commit = event.comment.commit_id.slice(0, 7);
		const commitUrl = `https://github.com/${event.repository.full_name}/commit/${event.comment.commit_id}`;

		this.embed
			.setURL(event.comment.html_url)
			.setDescription(markdownParser(event.comment.body).slice(0, EmbedLimits.MaximumDescriptionLength))
			.addFields([{ name: "On commit", value: `[\`${commit}\`](${commitUrl})` }]);
	}
}
