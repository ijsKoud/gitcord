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
	public constructor(url: string = env.DATABASE_URL) {
		const queryClient = postgres(url);
		this.db = drizzle(queryClient);
	}
}
