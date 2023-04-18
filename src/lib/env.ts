import { ZodError, z } from "zod";
import { Logger } from "@snowcrystals/icicle";
import { bold } from "colorette";

const logger = new Logger();
// List of environment variables which are used by this application
const envSchema = z.object({
	DISCORD_BOT_TOKEN: z.string().nonempty()
});

try {
	envSchema.parse(process.env);
} catch (err) {
	if (!(err instanceof ZodError<typeof envSchema>)) {
		console.error(err);
		process.exit(1);
	}

	// Filter out missing ones
	const missing = err.issues.filter((issue) => issue.message === "Required").map((issue) => bold(issue.path[0]));
	logger.fatal(`The following environment variables are missing: ${missing}`);

	const failedTest = err.issues.filter((issue) => issue.message !== "Required");
	for (const failedItem of failedTest) {
		// Environment variable
		const path = failedItem.path[0];
		logger.fatal(`[${path}]: Failed the test with reason: ${failedItem.message}`);
	}

	process.exit(1);
}

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof envSchema> {}
	}
}
