import { ErrorHandler as IgloErrorHandler, InteractionHandlerError } from "@snowcrystals/iglo";
import { bold, underline } from "colorette";
import { DiscordAPIError, type Interaction } from "discord.js";

export class ErrorHandler extends IgloErrorHandler {
	/**
	 * Logs the error and makes sure the user is aware of the situation. This function is overridable for customisability.
	 * @param error The error that was emitted
	 * @param interaction The interaction from the user that used the bot
	 */
	public override async handleError(error: Error, interaction?: Interaction): Promise<void> {
		if (error instanceof InteractionHandlerError) {
			let fatal = false;
			if (["InvalidDirectory", "noConstructorOptions"].includes(error.type)) fatal = true;

			const message = `${bold(underline(`InteractionHandlerError(${error.type})`))}: ${error.message}`;
			this.client.logger[fatal ? "fatal" : "error"](message);
		} else if (error instanceof DiscordAPIError && interaction && !this.isSilencedError(interaction.channelId ?? "", interaction.guildId, error))
			this.client.logger.error(`${bold(underline(`DiscordAPIError(${error.name})`))}: ${error.message}`);
		else this.client.logger.error(`${bold(underline(`Error(${error.name})`))}: ${error.message} --- raw=`, error);

		if (interaction && interaction.isRepliable())
			await interaction
				.followUp({
					content:
						"Welcome to our corner of errors, a place you shouldn't come to too often. It is probably not your fault though, something on our side brought you here. Stay safe out there, if this happens again make sure to contact the support team."
				})
				.catch(() => void 0);
	}
}
