import { IconOnlyButton, Toggle } from "@self-learning/ui/common";
import { MarkdownField } from "@self-learning/ui/forms";
import { getRandomId } from "@self-learning/util/common";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { MultipleChoiceQuestion } from "./schema";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function MultipleChoiceForm({
	index
}: {
	question: { type: MultipleChoiceQuestion["type"] };
	index: number;
}) {
	const { control, watch, setValue, register } =
		useFormContext<QuestionTypeForm<MultipleChoiceQuestion>>();
	const { append, replace } = useFieldArray({
		control,
		name: `quiz.questions.${index}.answers`
	});

	/** Unlike `fields` (from useFieldArray), this will always be rendered with latest data. */
	const answers = useWatch({
		name: `quiz.questions.${index}.answers`,
		control
	}) as MultipleChoiceQuestion["answers"];

	function addAnswer() {
		append({
			answerId: getRandomId(),
			isCorrect: false,
			content: ""
		});
	}

	function removeAnswer(answerIndex: number) {
		if (window.confirm("Antwort entfernen?")) {
			replace(answers.filter((_, i) => i !== answerIndex));
		}
	}

	return (
		<section className="flex flex-col gap-8">
			<div className="flex items-center gap-4">
				<h5 className="text-2xl font-semibold tracking-tight">Antworten</h5>
				<IconOnlyButton
					icon={<PlusIcon className="h-5 w-5" />}
					variant="primary"
					onClick={addAnswer}
					title={"Antwort hinzufügen"}
				/>
			</div>
			<div className="flex items-center gap-2">
				<Toggle
					value={watch(`quiz.questions.${index}.randomizeAnswers`)}
					onChange={value => setValue(`quiz.questions.${index}.randomizeAnswers`, value)}
					label="Antworten zufällig anordnen"
				/>
			</div>

			{answers.map((answer, answerIndex) => (
				<div
					key={answer.answerId}
					className={`relative flex flex-col gap-2 rounded-lg border p-4 ${
						answers?.[answerIndex]?.isCorrect
							? "border-secondary bg-c-primary-subtle"
							: "border-c-border-strong bg-c-surface-2"
					}`}
				>
					<div className="flex items-start gap-4 w-full">
						<div className="flex-1">
							<Controller
								control={control}
								name={`quiz.questions.${index}.answers.${answerIndex}.content`}
								render={({ field }) => (
									<MarkdownField
										content={field.value}
										setValue={field.onChange}
										placeholder="Antwort eingeben..."
										inline={true}
									/>
								)}
							></Controller>
						</div>

						<IconOnlyButton
							icon={<TrashIcon className="h-4 w-4" />}
							variant="danger"
							onClick={() => removeAnswer(answerIndex)}
							title={"Antwort entfernen"}
						/>
					</div>
					<label className="flex w-fit select-none items-center gap-2">
						<input
							type="checkbox"
							className="checkbox"
							{...register(
								`quiz.questions.${index}.answers.${answerIndex}.isCorrect`
							)}
						/>
						Richtige Antwort
					</label>
				</div>
			))}
		</section>
	);
}
