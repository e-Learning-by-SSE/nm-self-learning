import { MDXRemote } from "next-mdx-remote";
import type { MDXRemoteProps } from "next-mdx-remote";
import { markdownComponents } from "./code-group-container";

/** Render compiled Markdown with the same interactive components as the editor preview. */
export function MarkdownRemote({ components, ...props }: MDXRemoteProps) {
	return <MDXRemote {...props} components={{ ...markdownComponents, ...components }} />;
}
