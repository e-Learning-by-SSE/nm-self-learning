import { readFile } from "fs/promises";
import { join } from "path";
import { extractFrontMatter } from "./frontmatter";

describe("extractFrontMatter", () => {
	it("Document without front matter", async () => {
		const mdFile = await readFile(join(__dirname, "./test-examples/basic-example.md"), "utf8");
		const result = extractFrontMatter(mdFile);

		const expectedContent = [
			"# Basic Example",
			"",
			"This is file is used for testing purposes.",
			"",
			"-   One",
			"-   Two",
			"-   Three"
		].join("\n");

		expect(result.frontmatter).toEqual({});
		expect(result.content).toEqual(expectedContent);
		expect(result.excerpt).toBeNull();
	});

	it("Document front matter and excerpt", async () => {
		const mdFile = await readFile(
			join(__dirname, "./test-examples/with-frontmatter.md"),
			"utf8"
		);
		const result = extractFrontMatter(mdFile);

		const expectedContent = [
			"# With Frontmatter Example",
			"",
			"This is file is used for testing purposes.",
			"",
			"-   One",
			"-   Two",
			"-   Three"
		].join("\n");

		expect(result.frontmatter).toMatchInlineSnapshot(`
		Object {
		  "author": "Max Mustermann",
		  "date": "2022-01-01T00:00:00.000Z",
		  "slug": "with-front-matter-example",
		  "title": "With Frontmatter Example",
		}
	`);
		expect(result.content).toEqual(expectedContent);
		expect(result.excerpt).toEqual("This is the excerpt.");
	});

	it("Document with front matter and no content", async () => {
		const mdFile = await readFile(
			join(__dirname, "./test-examples/only-fontmatter.md"),
			"utf8"
		);
		const result = extractFrontMatter(mdFile);

		expect(result.frontmatter).toMatchInlineSnapshot(`
		Object {
		  "author": "Max Mustermann",
		  "date": "2022-01-01T00:00:00.000Z",
		  "slug": "only-frontmatter",
		  "title": "Only Frontmatter",
		}
	`);
		expect(result.content).toBeNull();
		expect(result.excerpt).toBeNull();
	});

	it("Document with front matter, content and no excerpt", async () => {
		const mdFile = await readFile(join(__dirname, "./test-examples/no-excerpt.md"), "utf8");
		const result = extractFrontMatter(mdFile);

		const expectedContent = [
			"# No Excerpt",
			"",
			"This is file is used for testing purposes.",
			"",
			"-   One",
			"-   Two",
			"-   Three"
		].join("\n");

		expect(result.frontmatter).toMatchInlineSnapshot(`
		Object {
		  "author": "Max Mustermann",
		  "date": "2022-01-01T00:00:00.000Z",
		  "slug": "no-excerpt",
		  "title": "No Excerpt",
		}
	`);
		expect(result.content).toEqual(expectedContent);
		expect(result.excerpt).toBeNull();
	});
});
