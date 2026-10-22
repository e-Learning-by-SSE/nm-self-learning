import { serialize } from "next-mdx-remote/serialize";
import rehypeExternalLinks from "rehype-external-links";
import { rehypeImageAttributes } from "./rehype-image-attributes";
// Rehype packages
import rehypeKatex from "rehype-katex";
import rehypePrismPlus from "rehype-prism-plus";
// Remark packages
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Pluggable } from "unified";
import { remarkCodeGroups } from "./remark-code-groups";

export const remarkPlugins = [remarkGfm, remarkMath, remarkCodeGroups];
export const rehypePlugins = [
	rehypeKatex,
	// Validate languages in Prism's own registry. A separate refractor instance can
	// lose its language registrations in the browser bundle and strip valid languages.
	[rehypePrismPlus, { ignoreMissing: true }] as Pluggable,
	rehypeImageAttributes,
	[rehypeExternalLinks, { target: "_blank" }] as Pluggable
];

/**
 * Converts a markdown document to an object that can be rendered in a {@link MDXRemote} component.
 * The given markdown string should not include front matter.
 *
 * @example
 * // i.e. in getStaticProps:
 * ```ts
 * const compiledMarkdown = compileMarkdown("#Hello World");
 * ```
 *
 * // In component:
 * ```tsx
 * <MDXRemote {...compiledMarkdown}></MDXRemote>
 * ```
 *
 */
export function compileMarkdown(markdown: string) {
	return serialize(markdown, {
		parseFrontmatter: true,
		mdxOptions: {
			format: "md",
			remarkPlugins,
			rehypePlugins
		}
	});
}

/**
 * Return type of the {@link compileMarkdown} function.
 * @example
 * type PageProps = {
 * 	markdownContent: CompiledMarkdown;
 * }
 *
 * export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
 * 	const markdownContent = await compileMarkdown(team.description);
 * 	return {
 * 		props: { markdownContent }
 * 	};
 * };
 */
export type CompiledMarkdown = Awaited<ReturnType<typeof compileMarkdown>>;

export type MdLookup = { [id: string]: CompiledMarkdown };
export type MdLookupArray = { [id: string]: CompiledMarkdown[] };
