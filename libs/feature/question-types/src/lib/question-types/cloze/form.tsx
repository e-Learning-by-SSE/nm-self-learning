import { EditorField, LabeledField } from "@self-learning/ui/forms";
import { Controller, useFormContext } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { Cloze } from "./schema";

export default function ClozeForm({ index }: { question: { type: Cloze["type"] }; index: number }) {
	const { control } = useFormContext<QuestionTypeForm<Cloze["question"]>>();

	return (
		<div className="flex flex-col gap-4">
			<LabeledField label="Lückentext">
				<Controller
					control={control}
					name={`quiz.questions.${index}.clozeText`}
					render={({ field }) => (
						<EditorField value={field.value} onChange={field.onChange} />
					)}
				/>
			</LabeledField>
		</div>
	);
}
