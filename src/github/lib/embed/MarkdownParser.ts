const COMMENT_REGEX = /<!--([\s\S]*?)-->/g;
const SUMMARY_BLOCK_REGEX = /<summary>([\s\S]*?)<\/summary>/g;
const DETAILS_BLOCK_REGEX = /<details>([\s\S]*?)<\/details>/g;
const DIV_BLOCK_REGEX = /<div>([\s\S]*?)<\/div>/g;

/**
 * Removes unneccessary content like HTML elements, comments and replaces them with appropiate markdown items
 * @param content The content to parse
 */
function markdownParser(content: string): string {
	return content
		.replace(COMMENT_REGEX, "")
		.replace(SUMMARY_BLOCK_REGEX, "➤ **$1**")
		.replace(DETAILS_BLOCK_REGEX, "$1")
		.replace(DIV_BLOCK_REGEX, "$1")
		.trim();
}

export default markdownParser;
