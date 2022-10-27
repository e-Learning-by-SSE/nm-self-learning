import "katex/dist/katex.css";

export function MarkdownContainer({
	children,
	className
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return <div className={`prose prose-emerald max-w-[75ch] ${className ?? ""}`}>{children}</div>;
}
