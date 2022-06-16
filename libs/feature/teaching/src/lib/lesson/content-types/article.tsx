import { Article } from "@self-learning/types";
import { SectionCard } from "@self-learning/ui/common";
import { MarkdownField } from "../../markdown-editor";
import { SetValueFn } from "../lesson-content";

const cacheKey = ["mdx-article"];

export function ArticleInput({
	index,
	onRemove,
	article,
	setValue
}: {
	index: number;
	setValue: SetValueFn;
	article: Article;
	onRemove: () => void;
}) {
	return (
		<div className="mx-auto w-[90vw]">
			<SectionCard title="Artikel" subtitle="Schreibe einen Artikel. Unterstützt Markdown.">
				<button
					className="absolute top-8 right-8 w-fit text-sm text-red-500"
					onClick={onRemove}
				>
					Entfernen
				</button>

				<MarkdownField
					content={article}
					setValue={value => setValue(article.type, { content: value }, index)}
					cacheKey={cacheKey}
				/>
			</SectionCard>
		</div>
	);
}
