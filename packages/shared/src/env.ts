import { z } from "zod";

const schema = z.object({
	DATABASE_URL: z.string().url(),
	SMEE_URL: z.string().url().optional(),
	DEVELOPMENT_GUILD_ID: z.string().optional(),
	DEVELOPMENT_WEBHOOK_ID: z.string().optional(),
	DEVELOPMENT_WEBHOOK_URL: z.string().url().optional(),
	WEBHOOK_SECRET: z.string().optional(),
	ENCRYPTION_KEY: z.string(),
	PORT: z
		.string()
		.transform((v) => parseInt(v, 10))
		.default("3000"),
	NODE_ENV: z.union([z.literal("development"), z.literal("production"), z.literal("test")])
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
