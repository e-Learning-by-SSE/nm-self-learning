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

const VERDICT_STYLES: Record<TextVerdict, string> = {
	correct: "border-green-500 bg-green-50 text-green-800",
	"partially-correct": "border-yellow-400 bg-yellow-50 text-yellow-800",
	"partially-wrong": "border-orange-400 bg-orange-50 text-orange-800",
	wrong: "border-c-danger bg-c-danger-subtle text-c-danger"
};

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

function LoadingIndicator() {
	const { t } = useTranslation("feature-question-types");
	return (
		<div className="flex items-center gap-3 rounded-lg border border-c-border bg-c-surface-2 p-4">
			<div className="h-5 w-5 animate-spin rounded-full border-2 border-c-primary border-t-transparent" />
			<span className="text-sm text-c-text-muted">
				{t("The AI is processing your response. Please wait!")}
			</span>
		</div>
	);
}

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

	if (evaluation.evaluationError) {
		return (
			<div className="rounded-lg border border-yellow-400 bg-yellow-50 p-4 text-yellow-800">
				<p className="font-medium">{t("Automatic evaluation is not available")}</p>
				<p className="mt-1 text-sm">
					{t(
						"The AI evaluation could not be performed. Your answer was accepted anyway."
					)}
				</p>
			</div>
		);
	}

	if (!hasAiConfig) {
		return (
			<div className="rounded-lg border border-green-500 bg-green-50 p-4 text-green-800">
				<p className="font-medium">{t("Answer submitted")}</p>
				<p className="mt-1 text-sm">
					{t(
						"Open-ended questions are not automatically evaluated and are therefore always marked as correct."
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
