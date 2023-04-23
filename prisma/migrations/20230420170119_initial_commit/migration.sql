-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('CHANNEL', 'FORUM');

-- CreateTable
CREATE TABLE "Guild" (
    "guild_id" TEXT NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "GuildWebhook" (
    "guild_id" TEXT NOT NULL,
    "webhook_secret" TEXT NOT NULL,
    "webhook_url" TEXT NOT NULL,
    "webhook_id" TEXT NOT NULL,
    "type" "ChannelType" NOT NULL,
    "repository_links" JSONB[],

    CONSTRAINT "GuildWebhook_pkey" PRIMARY KEY ("webhook_id")
);

-- AddForeignKey
ALTER TABLE "GuildWebhook" ADD CONSTRAINT "GuildWebhook_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("guild_id") ON DELETE RESTRICT ON UPDATE CASCADE;
