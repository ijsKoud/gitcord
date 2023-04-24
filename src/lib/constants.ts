import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// === Discord bot directory constants ===
export const BASE_BOT_DIR = join(__dirname, "..", "discord", "bot");
export const BOT_COMMANDS_DIR = join(BASE_BOT_DIR, "commands");
export const BOT_LISTENER_DIR = join(BASE_BOT_DIR, "listeners");
export const BOT_INTERACTIONS_DIR = join(BASE_BOT_DIR, "interactions");

export const GITHUB_AVATAR_URL = "https://cdn.ijskoud.dev/files/2zVGPBN3ZmId.webp";
