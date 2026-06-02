/**
 * ASYNC EVALUATION FLOW
 * CheckResult in question.tsx calls EVALUATION_FUNCTIONS["text"] synchronously,
 * which sets a placeholder: { pending: true } — no feedback, no evaluationError.
 * The useEffect below detects this placeholder via pending check, kicks off the async tRPC call,
 * and overwrites the result once the AI responds. A spinner is shown in between.
 */

import { TextArea } from "@self-learning/ui/forms";
import { trpc } from "@self-learning/api-client";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useQuestion } from "../../use-question-hook";
import { evaluateTextAnswerWithAI } from "./evaluate";
import {
	TextEvaluation,
	TextVerdict,
	TextEvaluateRouterInput,
	TextEvaluateRouterOutput
} from "./schema";

// Tailwind colour classes per verdict for the result box. Kept separate for readability.
const VERDICT_STYLES: Record<TextVerdict, string> = {
	correct: "border-green-500 bg-green-50 text-green-800",
	"partially-correct": "border-yellow-400 bg-yellow-50 text-yellow-800",
	"partially-wrong": "border-orange-400 bg-orange-50 text-orange-800",
	wrong: "border-c-danger bg-c-danger-subtle text-c-danger"
};

/**
 * The main component for rendering a text question, accepting the student's answer,
 * and showing the AI evaluation result once available.
 * The AI evaluation is triggered by a useEffect that watches for the placeholder { pending: true }
 * set by the synchronous CheckResult function. The actual evaluation logic is in evaluateTextAnswerWithAI(),
 * which calls the tRPC router and handles the response.
 * The component also handles the loading state while waiting for the AI response, and shows appropriate messages
 * if AI evaluation is not available or if an error occurs during evaluation.
 */
export default function TextAnswer() {
	const { question, setAnswer, answer, evaluation, setEvaluation } = useQuestion("text");
	const [isEvaluating, setIsEvaluating] = useState(false);
	const typedEvaluation = evaluation as TextEvaluation | null;
	const isSubmitted = !!evaluation || isEvaluating;
	const { mutateAsync: evaluateViaRouter } = trpc.textEvaluation.evaluate.useMutation();

	useEffect(() => {
		if (!typedEvaluation?.pending) return;
		if (isEvaluating) return;

		// Prevents a stale in-flight request from writing state after the student
		// clicks Reset (evaluation → null, cleanup runs) or navigates away.
		let ignored = false;

		void runAiEvaluation(() => ignored);

		return () => {
			ignored = true;
		};
	}, [evaluation]);

	async function runAiEvaluation(isIgnored: () => boolean) {
		if (!question.aiEvaluation) return;

		setIsEvaluating(true);

		try {
			const result = await evaluateTextAnswerWithAI(
				question,
				answer?.value ?? "",
				(input: TextEvaluateRouterInput): Promise<TextEvaluateRouterOutput> =>
					evaluateViaRouter(input)
			);
			if (!isIgnored()) {
				setEvaluation(result);
			}
		} finally {
			if (!isIgnored()) {
				setIsEvaluating(false);
			}
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<TextArea
				rows={12}
				label="Antwort"
				value={answer?.value ?? ""}
				disabled={isSubmitted}
				onChange={e => setAnswer({ type: "text", value: e.target.value })}
			/>

			{isEvaluating && <LoadingIndicator />}

			{/* Don't render while loading or while the placeholder is still in place */}
			{typedEvaluation && !isEvaluating && !typedEvaluation.pending && (
				<EvaluationResult
					evaluation={typedEvaluation}
					hasAiConfig={!!question.aiEvaluation}
				/>
			)}
		</div>
	);
}

// A simple loading indicator component shown while waiting for the AI evaluation response.
function LoadingIndicator() {
	const { t } = useTranslation("feature-question-types");
	return (
		<div className="flex items-center gap-3 rounded-lg border border-c-border bg-c-surface-2 p-4">
			<div className="h-5 w-5 animate-spin rounded-full border-2 border-c-primary border-t-transparent" />
			<span className="text-sm text-c-text-muted">{t("Evaluating... Please wait!")}</span>
		</div>
	);
}

/**
 * Component for displaying the result of the AI evaluation after it has completed.
 * Shows different messages and styles based on the verdict returned by the AI, whether an error occurred,
 * or if AI evaluation is not available due to missing configuration.
 * @param evaluation The result of the AI evaluation, including verdict, feedback, and any evaluation error.
 * @param hasAiConfig Boolean indicating whether AI evaluation is available (i.e., if the question has AI evaluation config)
 * @returns A styled box showing the evaluation verdict and feedback, or appropriate messages if evaluation is not available or if an error occurred.
 */
function EvaluationResult({
	evaluation,
	hasAiConfig
}: {
	evaluation: TextEvaluation;
	hasAiConfig: boolean;
}) {
	const { t } = useTranslation("feature-question-types");

	const VERDICT_LABELS: Record<TextVerdict, string> = {
		correct: t("Correct"),
		"partially-correct": t("Partially Correct"),
		"partially-wrong": t("Partially Wrong"),
		wrong: t("Wrong")
	};

	// If the evaluation contains an error, show a warning message instead of the verdict.
	if (evaluation.evaluationError) {
		return (
			<div className="rounded-lg border border-yellow-400 bg-yellow-50 p-4 text-yellow-800">
				<p className="font-medium">{t("Evaluation Failed.")}</p>
				<p className="mt-1 text-sm">
					{t(
						"An error occurred while evaluating the answer. Your answer was accepted anyway."
					)}
				</p>
			</div>
		);
	}

	// If no AI configuration is available, inform the student that their answer is accepted but not automatically evaluated.
	if (!hasAiConfig) {
		return (
			<div className="rounded-lg border border-gray-500 bg-gray-50 p-4 text-gray-800">
				<p className="font-medium">{t("Answer submitted")}</p>
				<p className="mt-1 text-sm">
					{t(
						"Evaluation is not available (answer accepted as correct without evaluation)"
					)}
				</p>
			</div>
		);
	}

	return (
		<div
			className={`rounded-lg border p-4 flex flex-col gap-2 ${VERDICT_STYLES[evaluation.verdict]}`}
		>
			<p className="font-semibold text-base">{VERDICT_LABELS[evaluation.verdict]}</p>
			{evaluation.feedback && (
				<p className="text-sm leading-relaxed">{evaluation.feedback}</p>
			)}
		</div>
	);
}
