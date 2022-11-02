import { SectionCard, SectionCardHeader } from "@self-learning/ui/common";
import { MarkdownField } from "@self-learning/ui/forms";
import { Controller } from "react-hook-form";

export function ArticleInput({ index }: { index: number }) {
	return (
		<SectionCard>
			<SectionCardHeader
				title="Artikel"
				subtitle="Schreibe einen Artikel. Unterstützt Markdown."
			/>

			<Controller
				name={`content.${index}.value.content`}
				render={({ field }) => (
					<MarkdownField
						content={field.value}
						setValue={value => field.onChange(value)}
					/>
				)}
			></Controller>
		</SectionCard>
	);
}
