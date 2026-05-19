/**
 * Student-facing component for open (text) questions.
 *
 * Three cases handled:
 *   1. No aiEvaluation config (legacy question)
 *      → textarea + "not graded" message on submit (FR-17)
 *   2. Has aiEvaluation config, evaluation succeeds
 *      → textarea → spinner → verdict label + AI feedback (FR-13, FR-14, FR-15)
 *   3. Has aiEvaluation config, evaluation fails for any reason
 *      → textarea → unified error message, answer accepted (FR-12, FR-16)
 *
 * ASYNC DESIGN:
 *   question.tsx's CheckResult calls EVALUATION_FUNCTIONS["text"] synchronously,
 *   which sets a lightweight placeholder evaluation { isCorrect: true, verdict: "correct" }.
 *   This component detects that placeholder via useEffect, immediately shows a spinner,
 *   calls textEvaluationRouter.evaluate via tRPC, and overwrites the placeholder with
 *   the real result once the AI responds.
 *
 *   The student sees: textarea → "Überprüfen" click → spinner → result.
 *   The quiz engine sees: null → placeholder (briefly) → real evaluation.
 */

import { TextArea } from "@self-learning/ui/forms";
import { trpc } from "@self-learning/api-client";
import { useState, useEffect } from "react";
import { useQuestion } from "../../use-question-hook";
import { evaluateTextAnswerWithAI } from "./evaluate";
import {
	TextEvaluation,
	TextVerdict,
	TextEvaluateRouterInput,
	TextEvaluateRouterOutput
} from "./schema";
import { useTranslation } from "next-i18next";

// Human-readable German label per verdict level
const VERDICT_LABELS: Record<TextVerdict, string> = {
	correct: "Richtig",
	"partially-correct": "Teilweise richtig",
	"partially-wrong": "Überwiegend falsch",
	wrong: "Falsch"
};

// Tailwind colour classes per verdict
const VERDICT_STYLES: Record<TextVerdict, string> = {
	correct: "border-green-500  bg-green-50   text-green-800",
	"partially-correct": "border-yellow-400 bg-yellow-50  text-yellow-800",
	"partially-wrong": "border-orange-400 bg-orange-50  text-orange-800",
	wrong: "border-c-danger   bg-c-danger-subtle text-c-danger"
};

/**
 * Returns true when the evaluation object is the synchronous placeholder produced
 * by evaluateTextLegacy() — i.e. it has NOT yet been overwritten by a real AI result.
 *
 * The placeholder shape is:  { isCorrect: true, verdict: "correct" }
 * A real AI result always has at least one of: feedback, evaluationError, or a
 * verdict that is NOT "correct".
 * An error result has evaluationError: true.
 *
 * So: { verdict: "correct", feedback: undefined, evaluationError: undefined } = placeholder.
 */
function isLegacyPlaceholder(ev: TextEvaluation): boolean {
	return (
		ev.verdict === "correct" && ev.feedback === undefined && ev.evaluationError === undefined
	);
}

export default function TextAnswer() {
	const { question, setAnswer, answer, evaluation, setEvaluation } = useQuestion("text");
	const [isEvaluating, setIsEvaluating] = useState(false);
	const typedEvaluation = evaluation as TextEvaluation | null;
	const isSubmitted = !!evaluation || isEvaluating;
	const { mutateAsync: evaluateViaRouter } = trpc.textEvaluation.evaluate.useMutation();
	useEffect(() => {
		// Not yet submitted, or no AI config on this question → nothing to do
		if (!typedEvaluation || !question.aiEvaluation) return;

		// Already a real result (AI success or error) → don't re-run
		if (!isLegacyPlaceholder(typedEvaluation)) return;

		// Already running → don't start a second call
		if (isEvaluating) return;

		void runAiEvaluation();
		// evaluation is the only dependency that triggers this:
		// when CheckResult sets the placeholder, this fires once.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [evaluation]);

	async function runAiEvaluation() {
		if (!question.aiEvaluation) return;

		setIsEvaluating(true);

		// evaluateTextAnswerWithAI handles all error cases and never throws.
		// It receives a typed callback so it stays decoupled from trpc imports.
		const result = await evaluateTextAnswerWithAI(
			question,
			answer?.value ?? "",
			(input: TextEvaluateRouterInput): Promise<TextEvaluateRouterOutput> =>
				evaluateViaRouter(input)
		);
		setEvaluation(result);
		setIsEvaluating(false);
	}

	return (
		<div className="flex flex-col gap-4">
			<TextArea
				rows={12}
				label="Antwort"
				value={answer?.value ?? ""}
				disabled={isSubmitted}
				onChange={e =>
					setAnswer({
						type: "text",
						value: e.target.value
					})
				}
			/>
			{isEvaluating && <LoadingIndicator />}

			{typedEvaluation && !isEvaluating && !isLegacyPlaceholder(typedEvaluation) && (
				<EvaluationResult
					evaluation={typedEvaluation}
					hasAiConfig={!!question.aiEvaluation}
				/>
			)}
		</div>
	);
}

// ─── Loading indicator ────────────────────────────────────────────────

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

// ─── Evaluation result display ─────────────────────────

function EvaluationResult({
	evaluation,
	hasAiConfig
}: {
	evaluation: TextEvaluation;
	hasAiConfig: boolean;
}) {
	const { t } = useTranslation("feature-question-types");
	// any AI failure (missing config, timeout, parse error, …) → unified message
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

	// legacy question without AI config → old "always correct" message
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

	// real AI result — show verdict label + feedback
	const verdictStyle = VERDICT_STYLES[evaluation.verdict];
	const verdictLabel = VERDICT_LABELS[evaluation.verdict];

	return (
		<div className={`rounded-lg border p-4 flex flex-col gap-2 ${verdictStyle}`}>
			<p className="font-semibold text-base">{verdictLabel}</p>
			{evaluation.feedback && (
				<p className="text-sm leading-relaxed">{evaluation.feedback}</p>
			)}
		</div>
	);
}
