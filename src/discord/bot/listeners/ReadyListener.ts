import { ApplyOptions, EventListener, type EventListenerOptions } from "@snowcrystals/iglo";
import { bold } from "colorette";
import { ActivityType } from "discord.js";

@ApplyOptions<EventListenerOptions>({ name: "ready", once: true })
export default class extends EventListener {
	public override run() {
		if (!this.client.isReady()) return;

		const username = bold(this.client.user.tag);
		this.client.logger.info(`${username} is up and running!`);

		this.client.user.setPresence({ activities: [{ name: "GitHub webhooks", type: ActivityType.Listening }] });
	}
}
