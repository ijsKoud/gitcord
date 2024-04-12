import { test } from "@japa/runner";
import { eq } from "drizzle-orm";
import { GuildForumModel, GuildModel, type GuildWebhookInsertModel, GuildWebhookModel } from "index.js";

import { decrypt } from "@/shared/utils.js";
import { GuildWebhooksTable } from "#lib/schema.js";

const MOCK_FORUM_ID = 1;
const MOCK_WEBHOOK_ID = "1111111";
const MOCK_GUILD_ID = "9876543210";
const SECRET = "TEST_SECRET";

const MOCK_WEBHOOK_DATA = {
	id: MOCK_WEBHOOK_ID,
	guildId: MOCK_GUILD_ID,
	createdAt: new Date(),
	webhook: "test.local.host",
	type: "forum",
	secret: SECRET
} satisfies GuildWebhookInsertModel;

test.group("GuildWebhookModel", (group) => {
	group.teardown(async () => {
		const guildWebhookModel = new GuildWebhookModel();
		await guildWebhookModel.delete(MOCK_WEBHOOK_ID);

		const guildForumModel = new GuildForumModel();
		await guildForumModel.delete(MOCK_FORUM_ID);

		const guildModel = new GuildModel();
		await guildModel.delete(MOCK_GUILD_ID);
		await guildModel.delete(`${MOCK_GUILD_ID}-1`);
	});

	group.setup(async () => {
		const guildModel = new GuildModel();
		await guildModel.create([{ id: MOCK_GUILD_ID, createdAt: new Date() }]);
	});

	test("it can create a new instance of GuildWebhookModel", ({ expect }) => {
		const guildForumModel = new GuildForumModel();
		expect(guildForumModel).toBeInstanceOf(GuildForumModel);
	});

	test("it can create a new guild webhook", async ({ expect }) => {
		const guildWebhookModel = new GuildWebhookModel();
		const webhook = await guildWebhookModel.create([MOCK_WEBHOOK_DATA]);
		webhook.forEach((webhook) => (webhook.secret = decrypt(webhook.secret)));

		expect(webhook).toStrictEqual([MOCK_WEBHOOK_DATA]);
	});

	test("it can get a guild webhook by its id", async ({ expect }) => {
		const guildWebhookModel = new GuildWebhookModel();
		const webhook = await guildWebhookModel.get(MOCK_WEBHOOK_ID);
		expect(webhook).toStrictEqual(MOCK_WEBHOOK_DATA);
	});

	test("it can get all guild webhooks", async ({ expect }) => {
		const guildWebhookModel = new GuildWebhookModel();
		const webhook = await guildWebhookModel.getAll();
		expect(webhook).toStrictEqual([MOCK_WEBHOOK_DATA]);
	});

	test("guild can have multiple guild webhooks", async ({ expect }) => {
		const guildWebhookModel = new GuildWebhookModel();
		const webhooks = await guildWebhookModel.query.select.where(eq(GuildWebhooksTable.guildId, MOCK_GUILD_ID));
		webhooks.forEach((webhook) => (webhook.secret = decrypt(webhook.secret)));

		expect(webhooks).toStrictEqual([MOCK_WEBHOOK_DATA, { ...MOCK_WEBHOOK_DATA, id: `${MOCK_WEBHOOK_ID}-1` }]);
	}).setup(async () => {
		const guildWebhookModel = new GuildWebhookModel();
		await guildWebhookModel.create([{ ...MOCK_WEBHOOK_DATA, id: `${MOCK_WEBHOOK_ID}-1` }]);
	});

	test("it can delete a guild webhook", async ({ expect }) => {
		const guildWebhookModel = new GuildWebhookModel();
		await guildWebhookModel.delete(MOCK_WEBHOOK_ID);

		expect(await guildWebhookModel.get(MOCK_WEBHOOK_ID)).toBe(null);
	});

	test("it can be deleted by a guild", async ({ expect }) => {
		const guildModel = new GuildModel();
		const guildWebhookModel = new GuildWebhookModel();

		await guildModel.delete(MOCK_GUILD_ID);
		const webhook = await guildWebhookModel.get(MOCK_WEBHOOK_ID);
		expect(webhook).toBe(null);
	}).setup(async () => {
		const guildWebhookModel = new GuildWebhookModel();
		await guildWebhookModel.create([MOCK_WEBHOOK_DATA]);
	});
});
