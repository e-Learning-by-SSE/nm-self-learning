import { PlusIcon } from "@heroicons/react/solid";
import { MultipleChoiceQuestion } from "@self-learning/types";
import { getRandomId } from "@self-learning/util/common";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { MarkdownField } from "../../../markdown-editor";
import { LessonFormModel } from "../../lesson-form-model";

export function MultipleChoiceForm({
	index
}: {
	question: { type: MultipleChoiceQuestion["type"] };
	index: number;
}) {
	const { control, register, watch } = useFormContext<LessonFormModel>();
	const {
		fields: answers,
		append,
		remove
	} = useFieldArray({
		control,
		name: `quiz.${index}.answers`
	});

	/** Unlike `answers` (see above), this will always be rendered with latest data. */
	const watchedAnswers = watch(`quiz.${index}.answers`);

	function addAnswer() {
		append({
			answerId: getRandomId(),
			isCorrect: false,
			content: ""
		});
	}

	function removeAnswer(answerIndex: number) {
		remove(answerIndex);
	}

	return (
		<section className="flex flex-col gap-8">
			<div className="flex items-center gap-4">
				<h5 className="text-2xl font-semibold tracking-tight">Antworten</h5>

				<button
					type="button"
					className="btn-stroked h-fit w-fit items-center"
					onClick={addAnswer}
				>
					<PlusIcon className="h-5" />
					<span>Antwort hinzufügen</span>
				</button>
			</div>

			{answers.map((answer, answerIndex) => (
				<div
					key={answer.answerId}
					className={`relative flex flex-col gap-4 rounded-lg border border-light-border p-4 ${
						watchedAnswers?.[answerIndex]?.isCorrect ? "bg-indigo-300" : "bg-indigo-50"
					}`}
				>
					<button
						type="button"
						className="absolute top-4 right-4 text-xs text-red-500"
						onClick={() => removeAnswer(answerIndex)}
					>
						Entfernen
					</button>
					<label className="flex w-fit items-center gap-2">
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
		</section>
	);
}
