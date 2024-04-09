import { test } from "@japa/runner";
import { PgDatabase } from "drizzle-orm/pg-core";

import { QueryClient } from "../../src/index.js";

test.group("QueryClient", () => {
	test("it can create a new instance of QueryClient", ({ expect }) => {
		const queryClient = new QueryClient();
		expect(queryClient).toBeInstanceOf(QueryClient);
	});

	test("QueryClient.db is an instance of pgDatabase", ({ expect }) => {
		const queryClient = new QueryClient();
		expect(queryClient.db).toBeInstanceOf(PgDatabase);
	});
});
