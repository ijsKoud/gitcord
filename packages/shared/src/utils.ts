import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import { env } from "./env.js";
/**
 * Transform a hex code to rgb
 * @param hex the hex code to transform
 * @returns An RGB array
 */
export function hexToRgb(hex: string): [green: number, blue: number, red: number] {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}

/**
 * Get the repository name from a payload
 * @param payload The event payload
 * @returns The repository full name
 * @example
 * ```ts
 * "ijskoud/gitcord"
 * ```
 */
export function getRepository(payload: Record<string, any>) {
	if ("repository" in payload) {
		const repository = payload.repository as { full_name: string };
		return repository.full_name;
	}

	return null;
}

const IV_LENGTH = 16;

/**
 * Encrypt a text
 * @param text The text to encrypt
 * @returns The encrypted text
 */
export function encrypt(text: string) {
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv("aes-256-cbc", Buffer.from(env.ENCRYPTION_KEY), iv);

	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);

	return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt a text
 * @param text The text to decrypt
 * @returns The decrypted text
 */
export function decrypt(text: string) {
	const textParts = text.split(":");
	const iv = Buffer.from(textParts.shift()!, "hex");

	const encryptedText = Buffer.from(textParts.join(":"), "hex");
	const decipher = createDecipheriv("aes-256-cbc", Buffer.from(env.ENCRYPTION_KEY), iv);

	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);

	return decrypted.toString();
}
