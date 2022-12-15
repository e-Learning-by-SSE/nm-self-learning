import { TextArea } from "@self-learning/ui/forms";
import { Feedback } from "../../feedback";
import { useQuestion } from "../../use-question-hook";

export default function TextAnswer() {
	const { setAnswer, answer, evaluation } = useQuestion("text");

	return (
		<>
			<TextArea
				rows={12}
				label="Antwort"
				value={answer.value}
				disabled={!!evaluation}
				onChange={e =>
					setAnswer({
						type: "text",
						value: e.target.value
					})
				}
			/>
			{evaluation && (
				<Feedback isCorrect={evaluation.isCorrect}>
					<p className="text-sm">
						Fragen vom Typ "Freitext" werden momentan nicht automatisch ausgewertet und
						daher immer als korrekt gewertet.
					</p>
				</Feedback>
			)}
		</>
	);
}
