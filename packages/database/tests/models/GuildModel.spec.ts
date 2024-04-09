import { test } from "@japa/runner";

import { type GuildInsertModel, GuildModel } from "../../src/index.js";

const MOCK_ID = "0123456789";
const mockdata = { id: MOCK_ID, webhook: "test.local.host", createdAt: new Date(), type: "forum" } satisfies GuildInsertModel;

test.group("GuildModel", (group) => {
	group.teardown(async () => {
		const guildModel = new GuildModel();
		await guildModel.delete(MOCK_ID);
	});

	test("it can create a new instance of GuildModel", ({ expect }) => {
		const guildModel = new GuildModel();
		expect(guildModel).toBeInstanceOf(GuildModel);
	});

	test("it can create a new guild", async ({ expect }) => {
		const guildModel = new GuildModel();
		const createdGuild = await guildModel.create([mockdata]);
		expect(createdGuild).toStrictEqual([mockdata]);
	});

	test("it can get a guild by its id", async ({ expect }) => {
		const guildModel = new GuildModel();
		const guild = await guildModel.get(MOCK_ID);
		expect(guild).toStrictEqual(mockdata);
	});

	test("it can get all guilds", async ({ expect }) => {
		const guildModel = new GuildModel();
		const guilds = await guildModel.getAll();
		expect(guilds).toStrictEqual([mockdata]);
	});

	test("it can update a guild by its id", async ({ expect }) => {
		const guildModel = new GuildModel();
		const updatedGuild = await guildModel.update(MOCK_ID, { webhook: "https://example.com", type: "text" });

		expect(updatedGuild).toStrictEqual({ ...mockdata, webhook: "https://example.com", type: "text" });
	});

	test("it can delete a guild", async ({ expect }) => {
		const guildModel = new GuildModel();
		await guildModel.delete(MOCK_ID);

		expect(await guildModel.get(MOCK_ID)).toBe(null);
	});
});
