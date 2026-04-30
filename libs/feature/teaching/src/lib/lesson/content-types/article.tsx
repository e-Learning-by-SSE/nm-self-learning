import { SectionCard } from "@self-learning/ui/common";
import { MarkdownField } from "@self-learning/ui/forms";
import { Controller, useFormContext } from "react-hook-form";
import { Article } from "@self-learning/types";

export function ArticleInput({ index }: { index: number }) {
	const { setValue } = useFormContext<{ content: Article[] }>();

	const handleChange = (value?: string) => {
		setValue(`content.${index}.value.content`, value ?? "");

		// Estimate reading time
		// https://doi.org/10.1016/j.jml.2019.104047: Avg reading speed is 238 (175 - 300) words per minute for non-fictional texts.
		// Used lower bound of 180 wpm = 3 words per second to be on the safe side.
		const words = value?.trim().split(/\s+/).filter(Boolean).length ?? 0;
		setValue(`content.${index}.meta.estimatedDuration`, words / 3);
	};

	return (
		<SectionCard>
			<Controller
				name={`content.${index}.value.content`}
				render={({ field }) => (
					<MarkdownField
						content={field.value}
						setValue={handleChange}
						header={"Artikel"}
					/>
				)}
			></Controller>
		</SectionCard>
	);
}
