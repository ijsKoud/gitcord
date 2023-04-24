import { GitHubEmbed, type GitHubEmbedOptions } from "#github/lib/embed/structures/GitHubEmbed.js";
import type { CreateEvent } from "@octokit/webhooks-types";
import type { EmbedBuilder } from "discord.js";
import { ApplyOptions } from "#github/lib/embed/decorators.js";
import _ from "lodash";

@ApplyOptions<GitHubEmbedOptions>({ name: "delete" })
export default class extends GitHubEmbed {
	public override run(event: CreateEvent, embed: EmbedBuilder) {
		const [, , ..._id] = event.ref.split(/\//g);
		const id = _id.join("/");
		const type = _.capitalize(event.ref_type);

		const updatedTitle = embed.data.title!.replace("{type}", type);
		embed.setTitle(updatedTitle).setDescription(`${type}: **${id}**`);

		return embed;
	}
}
