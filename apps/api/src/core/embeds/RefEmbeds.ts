import type { CreateEvent, DeleteEvent, WebhookEventName } from "@octokit/webhooks-types";
import _ from "lodash";

import { BaseEmbed, type GithubEvents } from "./BaseEmbed.js";

export class RefEmbeds extends BaseEmbed {
	public override run(event: GithubEvents, name: WebhookEventName): boolean {
		switch (name) {
			case "create":
				this.create(event as CreateEvent);
				break;
			case "delete":
				this.delete(event as DeleteEvent);
				break;
			default:
				return false;
		}

		return true;
	}

	/**
	 * create event embed handler
	 * @param event The create event data
	 * @returns
	 */
	private create(event: CreateEvent) {
		const type = _.capitalize(event.ref_type);
		const updatedTitle = this.embed.data.title!.replace("{type}", type);
		this.embed.setTitle(updatedTitle).setDescription(`${type}: **${event.ref}**`);
	}

	/**
	 * delete event embed handler
	 * @param event The delete event data
	 * @returns
	 */
	private delete(event: DeleteEvent) {
		const type = _.capitalize(event.ref_type);
		const updatedTitle = this.embed.data.title!.replace("{type}", type);
		this.embed.setTitle(updatedTitle).setDescription(`${type}: **${event.ref}**`);
	}
}
