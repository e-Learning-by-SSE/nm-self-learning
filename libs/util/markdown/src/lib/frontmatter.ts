//import { serialize } from "next-mdx-remote/serialize";
import * as matter from "gray-matter";

const separator = "---";

export type MarkdownDocument = {
	frontmatter: Record<string, unknown>;
	excerpt: string | null;
	content: string | null;
};

function excerptFn(file: matter.GrayMatterFile<string>) {
	const [excerpt, content] = file.content.split(separator);

	if (!content) {
		file.excerpt = "";
		file.content = excerpt.trim();
	} else {
		file.excerpt = excerpt.trim();
		file.content = content.trim();
	}

	return "";
}

export function extractFrontMatter(markdown: string): MarkdownDocument {
	const { data, content, excerpt } = matter(markdown, {
		// Typing from matter is wrong, see https://github.com/jonschlinkert/gray-matter/issues/125
		excerpt: excerptFn as any,
		excerpt_separator: separator
	});

	return {
		frontmatter: JSON.parse(JSON.stringify(data)), // Ensures that everything is serializable
		content: content?.length > 0 ? content : null,
		excerpt: excerpt && excerpt.length > 0 ? excerpt : null
	};
}
