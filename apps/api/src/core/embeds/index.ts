import type { WebhookEventName } from "@octokit/webhooks-types";
import type { APIEmbed } from "discord-api-types/v10";

import type { GithubEvents } from "./BaseEmbed.js";
import { CommitEmbeds } from "./CommitEmbeds.js";
import { IssueEmbeds } from "./IssueEmbeds.js";
import { PullRequestEmbeds } from "./PullRequestEmbeds.js";
import { RefEmbeds } from "./RefEmbeds.js";
import { RepositoryEmbeds } from "./RepositoryEmbeds.js";

export function getEmbed(event: GithubEvents, name: WebhookEventName): APIEmbed | null {
	if (["release", "package", "member", "milestone"].includes(name)) return new RepositoryEmbeds().generate(event, name);
	if (["push", "commit_comment"].includes(name)) return new CommitEmbeds().generate(event, name);
	if (["pull_request"].includes(name)) return new PullRequestEmbeds().generate(event, name);
	if (["issues", "issue_comment"].includes(name)) return new IssueEmbeds().generate(event, name);
	if (["create", "delete"].includes(name)) return new RefEmbeds().generate(event, name);

	return null;
}
