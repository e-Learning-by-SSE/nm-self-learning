import { SectionCard } from "@self-learning/ui/common";
import { MarkdownField } from "@self-learning/ui/forms";
import { Controller } from "react-hook-form";

export function ArticleInput({ index }: { index: number }) {
	return (
		<SectionCard>
			<Controller
				name={`content.${index}.value.content`}
				render={({ field }) => (
					<MarkdownField
						content={field.value}
						setValue={value => field.onChange(value)}
						header={"Artikel"}
					/>
				)}
			></Controller>
		</SectionCard>
	);
}
