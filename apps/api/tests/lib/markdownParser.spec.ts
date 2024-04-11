import { test } from "@japa/runner";

import markdownParser from "../../src/lib/markdownParser.js";

test.group("MarkdownParser", () => {
	test("it should convert headers to markdown", ({ expect }) => {
		const markdown = Array(6)
			.fill(null)
			.map((_, idx) => `${"#".repeat(idx + 1)} Hello World`);
		const html = Array(6)
			.fill(null)
			.map((_, idx) => `<h${idx + 1}>Hello World</h${idx + 1}>`);

		const result = html.map(markdownParser);
		expect(result).toStrictEqual(markdown);
	});

	test("it should convert paragraphs to markdown", ({ expect }) => {
		const markdown = "Hello World";
		const html = "<p>Hello World</p>";

		const result = markdownParser(html);
		expect(result).toStrictEqual(markdown);
	});

	test("it should convert summary blocks to markdown", ({ expect }) => {
		const markdown = "➤ **Hello World**";
		const html = "<summary>Hello World</summary>";

		const result = markdownParser(html);
		expect(result).toStrictEqual(markdown);
	});

	test("it should convert details blocks to markdown", ({ expect }) => {
		const markdown = "Hello World";
		const html = "<details>Hello World</details>";

		const result = markdownParser(html);
		expect(result).toStrictEqual(markdown);
	});

	test("it should convert div blocks to markdown", ({ expect }) => {
		const markdown = "Hello World";
		const html = "<div>Hello World</div>";

		const result = markdownParser(html);
		expect(result).toStrictEqual(markdown);
	});

	test("it should remove comments", ({ expect }) => {
		const markdown = "";
		const html = "<!-- Hello World -->";

		const result = markdownParser(html);
		expect(result).toStrictEqual(markdown);
	});
});
