import { test } from "@japa/runner";

import { type GuildFormInsertModel, GuildFormModel, GuildModel } from "../../src/index.js";

const MOCK_ID = "0123456789";
const MOCK_GUILD_ID = "9876543210";
const mockdata = {
	id: MOCK_ID,
	guildId: MOCK_GUILD_ID,
	createdAt: new Date(),
	post: MOCK_ID,
	repository: "ijskoud/gitcord"
} satisfies GuildFormInsertModel;

test.group("GuildFormModel", (group) => {
	group.teardown(async () => {
		const guildFormModel = new GuildFormModel();
		await guildFormModel.delete(MOCK_ID);

		const guildModel = new GuildModel();
		await guildModel.delete(MOCK_GUILD_ID);
	});

	test("it can create a new instance of GuildFormModel", ({ expect }) => {
		const guildFormModel = new GuildFormModel();
		expect(guildFormModel).toBeInstanceOf(GuildFormModel);
	});

	test("it can create a new guild form", async ({ expect }) => {
		const guildFormModel = new GuildFormModel();
		const guildModel = new GuildModel();

		await guildModel.create([{ id: MOCK_GUILD_ID, webhook: "test.local.host", createdAt: new Date(), type: "forum" }]);
		const createdGuild = await guildFormModel.create([mockdata]);
		expect(createdGuild).toStrictEqual([mockdata]);
	});

	test("it can get a guild form by its id", async ({ expect }) => {
		const guildFormModel = new GuildFormModel();
		const guild = await guildFormModel.get(MOCK_ID);
		expect(guild).toStrictEqual(mockdata);
	});

	test("it can get all guild forms", async ({ expect }) => {
		const guildFormModel = new GuildFormModel();
		const guilds = await guildFormModel.getAll();
		expect(guilds).toStrictEqual([mockdata]);
	});

	test("guild can have multiple guild forms", async ({ expect, cleanup }) => {
		const guildFormModel = new GuildFormModel();

		const MOCK_ID_2 = "0123456788";
		const mockdata2 = {
			...mockdata,
			id: MOCK_ID_2
		} satisfies GuildFormInsertModel;

		await guildFormModel.create([mockdata2]);
		const forms = await guildFormModel.getAll();

		cleanup(() => guildFormModel.delete(MOCK_ID_2));
		expect(forms).toStrictEqual([mockdata, mockdata2]);
	});

	test("it can update a guild form by its id", async ({ expect }) => {
		const guildFormModel = new GuildFormModel();
		const updatedGuild = await guildFormModel.update(MOCK_ID, { repository: "ijskoud/test" });

		expect(updatedGuild).toStrictEqual({ ...mockdata, repository: "ijskoud/test" });
	});

	test("it can delete a guild form", async ({ expect }) => {
		const guildFormModel = new GuildFormModel();
		await guildFormModel.delete(MOCK_ID);

		expect(await guildFormModel.get(MOCK_ID)).toBe(null);
	});

	test("it can be deleted by a guild", async ({ expect }) => {
		const guildModel = new GuildModel();
		const guildFormModel = new GuildFormModel();

		await guildFormModel.create([mockdata]);
		await guildModel.delete(MOCK_GUILD_ID);

		const form = await guildFormModel.get(MOCK_ID);
		expect(form).toBe(null);
	});
});
