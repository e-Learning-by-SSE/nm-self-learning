/**
 * EVALUATION_FUNCTIONS["text"] in the registry is synchronous, but AI evaluation
 * requires a network call. We bridge this by splitting into two functions:
 *
 * - evaluateTextAnswerWithAI(): async, called directly from component.tsx after
 *   the placeholder is detected. Overwrites the placeholder with the real result.
 *
 * - evaluateTextWithoutAI(): sync, returns a default correct evaluation with feedback
 *   explaining that AI evaluation is not available. Called from component.tsx when no
 *   AI configuration is available.
 *
 * - evaluateTextSync(): synchronous, returns a placeholder if AI evaluation is configured,
 *   or a default correct evaluation if not. Called from the registry and sets the initial state.
 */

import {
	TextEvaluation,
	TextQuestion,
	TextVerdict,
	TextEvaluateRouterInput,
	TextEvaluateRouterOutput
} from "./schema";
import { useTranslation } from "next-i18next";

function verdictToIsCorrect(verdict: TextVerdict): boolean {
	return verdict === "correct";
}

function buildErrorEvaluation(): TextEvaluation {
	return {
		isCorrect: true,
		verdict: "partially-correct",
		evaluationError: true
	};
}

/**
 * Evaluates a student's answer using AI/LLM.
 */
export async function evaluateTextAnswerWithAI(
	question: TextQuestion,
	studentAnswer: string,
	callRouter: (input: TextEvaluateRouterInput) => Promise<TextEvaluateRouterOutput>
): Promise<TextEvaluation> {
	if (!question.aiEvaluation || !question.aiEvaluation.solutionOrConcepts.trim()) {
		return evaluateTextWithoutAI();
	}

	try {
		const result = await callRouter({
			questionStatement: question.statement,
			solutionOrConcepts: question.aiEvaluation.solutionOrConcepts,
			passingThreshold: question.aiEvaluation.passingThreshold,
			studentAnswer
		});

		return {
			isCorrect: verdictToIsCorrect(result.verdict),
			verdict: result.verdict,
			feedback: result.feedback
		};
	} catch (err) {
		console.error("[TextEvaluate] AI evaluation failed:", err);
		return buildErrorEvaluation();
	}
}

/**
 * Evaluate Student's asnwer without AI by marking it true with static feedback
 */
export function evaluateTextWithoutAI(): TextEvaluation {
	const { t } = useTranslation("feature-question-types");
	return {
		isCorrect: true,
		verdict: "partially-correct",
		feedback: t(
			"AI evaluation is not available (answer accepted as correct without AI evaluation)"
		)
	};
}

/**
 * Synchronous evaluation called by EVALUATION_FUNCTIONS["text"] in the registry.
 */
export function evaluateTextSync(question: TextQuestion): TextEvaluation {
	const hasAiConfig = !!question.aiEvaluation?.solutionOrConcepts?.trim();

	if (hasAiConfig) {
		return {
			isCorrect: false,
			verdict: "wrong",
			pending: true
		};
	}

	return {
		isCorrect: true,
		verdict: "correct"
	};
}
