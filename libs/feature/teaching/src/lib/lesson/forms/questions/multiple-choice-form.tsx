import { MultipleChoiceQuestion } from "@self-learning/types";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { MarkdownField } from "../../../markdown-editor";
import { LessonFormModel } from "../../lesson-editor";

export function MultipleChoiceForm({
	index
}: {
	question: { type: MultipleChoiceQuestion["type"] };
	index: number;
}) {
	const { control, register } = useFormContext<LessonFormModel>();
	const {
		fields: answers,
		append,
		remove
	} = useFieldArray({
		control,
		name: `quiz.${index}.answers`
	});

	function addAnswer() {
		append({
			answerId: window.crypto.randomUUID(),
			isCorrect: false,
			content: ""
		});
	}

	function removeAnswer(answerIndex: number) {
		remove(answerIndex);
	}

	return (
		<div className="flex flex-col gap-4">
			<button type="button" className="btn-stroked w-fit" onClick={addAnswer}>
				Antwort hinzufügen
			</button>

			{answers.map((answer, answerIndex) => (
				<div
					key={answer.answerId}
					className="relative flex flex-col gap-4 rounded-lg border border-light-border bg-indigo-50 p-4"
				>
					<button
						type="button"
						className="absolute top-4 right-4 text-xs text-red-500"
						onClick={() => removeAnswer(answerIndex)}
					>
						Entfernen
					</button>
					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							className="rounded text-secondary"
							{...register(`quiz.${index}.answers.${answerIndex}.isCorrect`)}
						/>
						Diese Antwort ist korrekt.
					</label>

					<Controller
						control={control}
						name={`quiz.${index}.answers.${answerIndex}.content`}
						render={({ field }) => (
							<MarkdownField
								content={field.value}
								setValue={field.onChange}
								cacheKey={[`answer-${answer.answerId}`]}
								minHeight="128px"
							/>
						)}
					></Controller>
				</div>
			))}
		</div>
	);
}
