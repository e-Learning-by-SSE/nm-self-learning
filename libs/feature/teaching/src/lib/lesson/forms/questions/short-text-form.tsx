import { PlusIcon } from "@heroicons/react/solid";
import { ShortTextQuestion } from "@self-learning/types";
import { getRandomId } from "@self-learning/util/common";
import { useFieldArray, useFormContext } from "react-hook-form";

export function ShortTextForm({
	index
}: {
	question: { type: ShortTextQuestion["type"] };
	index: number;
}) {
	const { control, register } = useFormContext<{ quiz: ShortTextQuestion[] }>();
	const {
		fields: acceptedAnswers,
		append,
		remove
	} = useFieldArray({
		control,
		name: `quiz.${index}.acceptedAnswers`
	});

	function addAnswer() {
		append({
			acceptedAnswerId: getRandomId(),
			value: ""
		});
	}

	function removeAnswer(answerIndex: number) {
		remove(answerIndex);
	}

	return (
		<section className="flex flex-col gap-8">
			<div className="flex items-center gap-4">
				<h5 className="text-2xl font-semibold tracking-tight">Akzeptierte Antworten</h5>

				<button
					type="button"
					className="btn-stroked h-fit w-fit items-center"
					onClick={addAnswer}
				>
					<PlusIcon className="h-5" />
					<span>Antwort hinzufügen</span>
				</button>
			</div>

			{acceptedAnswers.length > 0 && (
				<div className="flex flex-col gap-4">
					{acceptedAnswers.map((acceptedAnswer, acceptedAnswerIndex) => (
						<div className="flex gap-4" key={acceptedAnswer.acceptedAnswerId}>
							<input
								{...register(
									`quiz.${index}.acceptedAnswers.${acceptedAnswerIndex}.value`
								)}
								placeholder="Antwort"
								autoComplete="off"
							/>
							<button
								type="button"
								className="text-xs text-red-500"
								onClick={() => removeAnswer(acceptedAnswerIndex)}
							>
								Entfernen
							</button>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
