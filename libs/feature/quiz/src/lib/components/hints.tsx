import { LightBulbIcon } from "@heroicons/react/24/outline";
import { useQuestion } from "@self-learning/question-types";
import { Divider } from "@self-learning/ui/common";
import { MarkdownContainer } from "@self-learning/ui/layouts";
import { motion } from "framer-motion";
import { MarkdownRemote as MDXRemote } from "@self-learning/markdown";
import { useQuiz } from "./quiz-context";
import { useTranslation } from "next-i18next";

export function Hints() {
	const { t } = useTranslation("feature-quiz");
	const { config, usedHints, setUsedHints } = useQuiz();
	const { question, markdown } = useQuestion("exact");

	const usedHintsCurrent = usedHints[question.questionId] ?? [];

	const hintsCurrentQuestion = markdown.hintsMd[question.questionId] ?? [];
	const usedHintsTotal = Object.values(usedHints).reduce((sum, arr) => sum + arr.length, 0);
	const totalNumberOfHints = Object.values(markdown.hintsMd).reduce(
		(sum, arr) => sum + arr.length,
		0
	);

	const hintsRemainingTotal =
		Math.min(config.hints.maxHints, totalNumberOfHints) - usedHintsTotal;

	function useHint() {
		const nextHint = markdown.hintsMd[question.questionId][usedHintsCurrent.length];

		if (nextHint) {
			setUsedHints(prev => ({
				...prev,
				[question.questionId]: [...(prev[question.questionId] ?? []), nextHint]
			}));
		} else {
			console.error("No more hints available.");
		}
	}

	return (
		<>
			<div className="flex flex-col gap-8">
				<Divider />
				{usedHintsCurrent.map((hint, index) => (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1 }}
						key={index}
						className="relative flex max-w-full flex-col gap-4 rounded-lg border border-yellow-400 bg-yellow-100 p-4"
					>
						<LightBulbIcon className="absolute right-2 top-2 h-6 text-yellow-500" />
						<MarkdownContainer>
							<MDXRemote {...hint} />
						</MarkdownContainer>
					</motion.div>
				))}
			</div>

			<div className="flex items-center gap-4">
				<button
					className="btn-stroked w-fit"
					onClick={useHint}
					disabled={usedHintsCurrent.length === hintsCurrentQuestion.length}
				>
					<LightBulbIcon className="icon h-5" />
					{hintsCurrentQuestion.length === 0 ? (
						<span>{t("No_Hints_Available")}</span>
					) : (
						<span>
							{t("Use_Hint", {
								used: usedHintsCurrent.length,
								total: hintsCurrentQuestion.length
							})}
						</span>
					)}
				</button>

				{hintsRemainingTotal > 0 ? (
					<span className="text-sm text-c-text-muted">
						{t("Hints_Remaining", { count: hintsRemainingTotal })}
					</span>
				) : (
					<span className="text-sm opacity-25">{t("No_Hints_Remaining")}</span>
				)}
			</div>
		</>
	);
}
