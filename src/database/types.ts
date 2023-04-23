import type { Guild, GuildWebhook } from "@prisma/client";

/** Full guild config including guildWebhooks */
export type GuildConfig = Guild & { guildWebhooks: GuildWebhook[] };
