import { ApplyOptions, EventListener, type EventListenerOptions } from "@snowcrystals/iglo";
import { bold } from "colorette";

@ApplyOptions<EventListenerOptions>({ name: "ready", once: true })
export default class extends EventListener {
	public override run() {
		const username = bold(this.client.user!.tag);
		this.client.logger.info(`${username} is up and running!`);
	}
}
