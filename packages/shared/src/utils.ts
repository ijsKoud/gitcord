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
