/**
 * Client-side evaluation helper for open (text) questions.
 *
 * ARCHITECTURE:
 * -------------
 * Prompt building, LLM communication, response parsing, and temperature
 * settings all live in text-evaluation.router.ts (server-side).
 * This file has ONE responsibility: translate the router's typed response
 * into a TextEvaluation object the quiz engine understands, and handle
 * every failure case so the component never has to.
 *
 * SYNC vs ASYNC SPLIT:
 *   EVALUATION_FUNCTIONS["text"] in the registry is synchronous.
 *   AI evaluation is async (network call). We solve this by splitting:
 *
 *   1. EVALUATION_FUNCTIONS["text"] → evaluateTextLegacy()
 *      Used for old questions (no aiEvaluation config). Always returns
 *      { isCorrect: true }. The quiz engine sees this immediately.
 *
 *   2. evaluateTextAnswerWithAI() → called from component.tsx
 *      For questions WITH aiEvaluation config. The component detects the
 *      sync placeholder, calls this function, and overwrites the evaluation
 *      once the async result arrives. A spinner is shown in between.
 */

import { TextEvaluation, TextQuestion, TextVerdict } from "./schema";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * The typed input expected by textEvaluationRouter.evaluate on the server.
 * Mirrors evaluateInputSchema in text-evaluation.router.ts exactly.
 */
export interface TextEvaluateRouterInput {
	questionStatement: string;
	solutionOrConcepts: string;
	passingThreshold: number;
	studentAnswer: string;
}

/**
 * The typed output returned by textEvaluationRouter.evaluate.
 * Mirrors evaluateOutputSchema in text-evaluation.router.ts exactly.
 */
export interface TextEvaluateRouterOutput {
	verdict: TextVerdict;
	feedback: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps the four-level verdict to the quiz engine's boolean.
 * FR-03: Only "correct" → true; everything else → false.
 */
function verdictToIsCorrect(verdict: TextVerdict): boolean {
	return verdict === "correct";
}

/**
 * Builds the error evaluation returned on any failure.
 * FR-12, FR-16: Accept the answer so quiz progress is never blocked.
 */
function buildErrorEvaluation(): TextEvaluation {
	return {
		isCorrect: true, // FR-16: student is not blocked
		verdict: "correct", // quiz engine sees passing
		evaluationError: true // component reads this to show the fallback message
	};
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Evaluates a student's text answer by calling textEvaluationRouter.evaluate.
 *
 * Called from component.tsx — NOT from EVALUATION_FUNCTIONS.
 * Never throws: all failure cases return buildErrorEvaluation() (FR-12).
 *
 * @param question         The full TextQuestion (contains aiEvaluation config)
 * @param studentAnswer    The raw string the student typed
 * @param callRouter       The tRPC mutateAsync function injected by component.tsx.
 *                         Accepts TextEvaluateRouterInput, returns TextEvaluateRouterOutput.
 *                         Injecting it keeps this file decoupled from the trpc client.
 */
export async function evaluateTextAnswerWithAI(
	question: TextQuestion,
	studentAnswer: string,
	callRouter: (input: TextEvaluateRouterInput) => Promise<TextEvaluateRouterOutput>
): Promise<TextEvaluation> {
	// Guard: should never happen if the component checks aiEvaluation first
	if (!question.aiEvaluation) {
		return buildErrorEvaluation();
	}

	try {
		// All prompt building, LLM config fetching, HTTP call, response parsing,
		// and temperature: 0 happen inside the router. We only pass the data.
		const result = await callRouter({
			questionStatement: question.statement,
			solutionOrConcepts: question.aiEvaluation.solutionOrConcepts,
			passingThreshold: question.aiEvaluation.passingThreshold,
			studentAnswer
		});

		// FR-03: map verdict → isCorrect for the quiz engine
		// FR-02: preserve verdict + feedback for the component to display
		return {
			isCorrect: verdictToIsCorrect(result.verdict),
			verdict: result.verdict,
			feedback: result.feedback
		};
	} catch (err) {
		// FR-12: any tRPC error (NOT_FOUND config, TIMEOUT, INTERNAL_SERVER_ERROR,
		// rate limit, malformed JSON) ends up here → show fallback, never crash.
		console.error("[TextEvaluate] AI evaluation failed:", err);
		return buildErrorEvaluation();
	}
}

// ─── Legacy path ──────────────────────────────────────────────────────────────

/**
 * Synchronous evaluation for old questions without aiEvaluation config.
 * Used by EVALUATION_FUNCTIONS["text"] in question-type-registry.tsx.
 * FR-17: existing questions continue working exactly as before.
 */
export function evaluateTextLegacy(): TextEvaluation {
	return {
		isCorrect: true,
		verdict: "correct"
	};
}
