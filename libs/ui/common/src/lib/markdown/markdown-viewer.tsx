import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";
import ReactMarkdown from "react-markdown";

/**
 * Client-side Markdown renderer.
 *
 * If possible, prefer server-side rendering instead of using this component.
 */
export function MarkdownViewer({ content }: { content: string }) {
	return (
		<div className="prose prose-emerald">
			<ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
				{content ?? ""}
			</ReactMarkdown>
		</div>
	);
}
