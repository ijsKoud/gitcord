import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { singleton } from "tsyringe";

import { env } from "@/shared/env.js";

@singleton()
export class QueryClient {
	public readonly db: ReturnType<typeof drizzle>;

	/**
	 * @param url The URL of the database to connect to
	 */
	public constructor() {
		const queryClient = postgres(env.DATABASE_URL);
		this.db = drizzle(queryClient);
	}
}
