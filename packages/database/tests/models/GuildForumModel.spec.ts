import { test } from "@japa/runner";

import { type GuildForumInsertModel, GuildForumModel, GuildModel } from "../../src/index.js";

const MOCK_ID = 1;
const MOCK_GUILD_ID = "9876543210";
const mockdata = {
	guildId: MOCK_GUILD_ID,
	createdAt: new Date(),
	post: "0123456789",
	id: MOCK_ID,
	repository: "ijskoud/gitcord"
} satisfies GuildForumInsertModel;

test.group("GuildForumModel", (group) => {
	group.teardown(async () => {
		const guildForumModel = new GuildForumModel();
		await guildForumModel.delete(MOCK_ID);

		const guildModel = new GuildModel();
		await guildModel.delete(MOCK_GUILD_ID);
	});

	test("it can create a new instance of GuildForumModel", ({ expect }) => {
		const guildForumModel = new GuildForumModel();
		expect(guildForumModel).toBeInstanceOf(GuildForumModel);
	});

	test("it can create a new guild form", async ({ expect }) => {
		const guildForumModel = new GuildForumModel();
		const guildModel = new GuildModel();

		await guildModel.create([{ id: MOCK_GUILD_ID, webhook: "test.local.host", createdAt: new Date(), type: "forum" }]);
		const createdGuild = await guildForumModel.create([mockdata]);
		expect(createdGuild).toStrictEqual([mockdata]);
	});

	test("it can get a guild form by its id", async ({ expect }) => {
		const guildForumModel = new GuildForumModel();
		const guild = await guildForumModel.get(MOCK_ID);
		expect(guild).toStrictEqual(mockdata);
	});

	test("it can get all guild forms", async ({ expect }) => {
		const guildForumModel = new GuildForumModel();
		const guilds = await guildForumModel.getAll();
		expect(guilds).toStrictEqual([mockdata]);
	});

	test("guild can have multiple guild forms", async ({ expect, cleanup }) => {
		const guildForumModel = new GuildForumModel();

		const MOCK_ID_2 = 2;
		const mockdata2 = {
			...mockdata,
			id: MOCK_ID_2
		} satisfies GuildForumInsertModel;

		await guildForumModel.create([mockdata2]);
		const forms = await guildForumModel.getAll();

		cleanup(() => guildForumModel.delete(MOCK_ID_2));
		expect(forms).toStrictEqual([mockdata, mockdata2]);
	});

	test("it can update a guild form by its id", async ({ expect }) => {
		const guildForumModel = new GuildForumModel();
		const updatedGuild = await guildForumModel.update(MOCK_ID, { repository: "ijskoud/test" });

		expect(updatedGuild).toStrictEqual({ ...mockdata, repository: "ijskoud/test" });
	});

	test("it can delete a guild form", async ({ expect }) => {
		const guildForumModel = new GuildForumModel();
		await guildForumModel.delete(MOCK_ID);

		expect(await guildForumModel.get(MOCK_ID)).toBe(null);
	});

	test("it can be deleted by a guild", async ({ expect }) => {
		const guildModel = new GuildModel();
		const guildForumModel = new GuildForumModel();

		await guildForumModel.create([mockdata]);
		await guildModel.delete(MOCK_GUILD_ID);

		const form = await guildForumModel.get(MOCK_ID);
		expect(form).toBe(null);
	});
});
