import { useTranslation } from "next-i18next";
import { LabeledField } from "@self-learning/ui/forms";
import { Feedback } from "../../feedback";
import { useQuestion } from "../../use-question-hook";

export default function ExactAnswer() {
	const { t } = useTranslation("feature-question-types");
	const { question, answer, setAnswer, evaluation } = useQuestion("exact");

	return (
		<>
			<LabeledField label={t("Answer")}>
				<input
					value={answer.value ?? ""}
					onChange={e =>
						setAnswer({
							questionId: question.questionId,
							type: question.type,
							value: e.target.value
						})
					}
					disabled={!!evaluation}
					className="textfield"
					type="text"
				/>
			</LabeledField>

			{evaluation && (
				<Feedback isCorrect={evaluation.isCorrect}>
					<div className="flex flex-col gap-2">
						<span>{t("Accepted_Answers")}</span>

						<ul className="list-inside list-disc">
							{question.acceptedAnswers.map(ans => (
								<li key={ans.acceptedAnswerId}>{ans.value}</li>
							))}
						</ul>
					</div>
				</Feedback>
			)}
		</>
	);
}
