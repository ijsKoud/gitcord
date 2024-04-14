import type { Config } from "drizzle-kit";

export default {
	schema: "./src/lib/schema.ts",
	out: "./drizzle",
	driver: "pg",
	verbose: true,
	dbCredentials: {
		connectionString: process.env.DATABASE_URL ?? ""
	}
} satisfies Config;
