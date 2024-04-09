import { z } from "zod";

const schema = z.object({
	DATABASE_URL: z.string().url()
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
