import { TextArea } from "@self-learning/ui/forms";
import { useQuestion } from "../../use-question-hook";
import { motion } from "framer-motion";

export default function TextAnswer() {
	const { setAnswer, answer, evaluation } = useQuestion("text");

	return (
		<div className="flex flex-col gap-8">
			<TextArea
				rows={12}
				label="Antwort"
				value={answer.value}
				onChange={e =>
					setAnswer({
						type: "text",
						value: e.target.value
					})
				}
			/>
			{evaluation && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ type: "tween", duration: 0.5 }}
					className={`rounded-lg border p-4 text-white ${
						evaluation.isCorrect
							? "border-green-500 bg-green-100 text-green-500"
							: " border-red-500 bg-red-100 text-red-500"
					}`}
				>
					<p className="font-medium">
						Fragen vom Typ "Text" werden momentan nicht automatisch ausgewertet und
						daher immer als korrekt gewertet.
					</p>
				</motion.div>
			)}
		</div>
	);
}
