import type { CreateEvent, DeleteEvent, WebhookEventName } from "@octokit/webhooks-types";
import _ from "lodash";

import { BaseEmbed, type GithubEvents } from "./BaseEmbed.js";

export class RefEmbeds extends BaseEmbed {
	public override run(event: GithubEvents, name: WebhookEventName): boolean {
		switch (name) {
			case "create":
				return this.create(event as CreateEvent);
			case "delete":
				return this.delete(event as DeleteEvent);
			default:
				return false;
		}
	}

	/**
	 * create event embed handler
	 * @param event The create event data
	 * @returns
	 */
	private create(event: CreateEvent) {
		if (event.ref.startsWith("branches/")) return false;

		const type = _.capitalize(event.ref_type);
		const updatedTitle = this.embed.data.title!.replace("{type}", type);
		this.embed.setTitle(updatedTitle).setDescription(`${type}: **${event.ref}**`);

		return true;
	}

	/**
	 * delete event embed handler
	 * @param event The delete event data
	 * @returns
	 */
	private delete(event: DeleteEvent) {
		if (event.ref.startsWith("branches/")) return false;

		const type = _.capitalize(event.ref_type);
		const updatedTitle = this.embed.data.title!.replace("{type}", type);
		this.embed.setTitle(updatedTitle).setDescription(`${type}: **${event.ref}**`);

		return true;
	}
}
