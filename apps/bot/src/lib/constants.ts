import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// === Discord bot directory constants ===
export const BASE_BOT_DIR = join(__dirname, "..", "core");
export const BOT_COMMANDS_DIR = join(BASE_BOT_DIR, "commands");
export const BOT_LISTENER_DIR = join(BASE_BOT_DIR, "listeners");
export const BOT_INTERACTIONS_DIR = join(BASE_BOT_DIR, "interactions");
