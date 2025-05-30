// markdown-viewer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";

export function MarkdownViewer({ content }: { content: string }) {
	return (
		<div className="prose prose-emerald">
			<ReactMarkdown rehypePlugins={rehypePlugins} remarkPlugins={remarkPlugins}>
				{content ?? ""}
			</ReactMarkdown>
		</div>
	);
}
