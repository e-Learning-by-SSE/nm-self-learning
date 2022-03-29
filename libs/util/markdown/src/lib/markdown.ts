import { serialize } from "next-mdx-remote/serialize";

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
	return serialize(markdown);
}
