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

/**
 * Converts the AI evaluation verdict into a boolean isCorrect value for the TextEvaluation.
 * Only "correct" verdicts are marked as true, all others (including partially correct/wrong) are false.
 * @param verdict The AI evaluation verdict.
 * @returns A boolean indicating whether the answer is correct.
 */
function verdictToIsCorrect(verdict: TextVerdict): boolean {
	return verdict === "correct";
}

/**
 * Builds a TextEvaluation object representing an error state when AI evaluation fails.
 * The evaluation is marked as "partially-correct" to indicate that the system could not determine correctness,
 * and an evaluationError flag is set to true for the UI to show an appropriate message.
 * @returns A TextEvaluation object representing the error state.
 */
function buildErrorEvaluation(): TextEvaluation {
	return {
		isCorrect: true,
		verdict: "partially-correct",
		evaluationError: true
	};
}

/**
 * Evaluates a student's free-text answer using the configured LLM by calling the provided router function.
 * If no AI evaluation configuration is present, it falls back to a default evaluation without AI.
 * The function handles the async call to the tRPC router, processes the response, and returns a TextEvaluation object
 * that includes whether the answer is correct, the AI's verdict, feedback for the student, and any evaluation error state.
 * @param question The TextQuestion object containing the question statement and AI evaluation configuration.
 * @param studentAnswer The free-text answer provided by the student.
 * @param callRouter A function that takes the input for the evaluation router and returns a promise of the output. This abstracts away the actual tRPC call for easier testing and separation of concerns.
 * @returns A promise that resolves to a TextEvaluation object representing the result of the evaluation.
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

		if (!result.ok) {
			// In case of any error during the evaluation process (network issues, server errors, unexpected response format, etc.),
			// we return a default evaluation indicating that the evaluation could not be completed,
			// but we mark it as partially correct to avoid penalizing the student.
			return buildErrorEvaluation();
		}

		return {
			isCorrect: verdictToIsCorrect(result.verdict),
			verdict: result.verdict,
			feedback: result.feedback
		};
	} catch (error) {
		return buildErrorEvaluation();
	}
}

/**
 * Returns a default TextEvaluation when AI evaluation is not available, indicating that the answer is accepted as correct
 * but without any AI-generated feedback. This is used when the teacher has not configured the AI evaluation (i.e., no solution or concepts provided).
 * @returns A TextEvaluation object representing the default evaluation without AI.
 */
export function evaluateTextWithoutAI(): TextEvaluation {
	return {
		isCorrect: true,
		verdict: "partially-correct"
	};
}

/**
 * The synchronous evaluation function for text questions, used in the registry to set the initial evaluation state.
 * If AI evaluation is configured (i.e., a solution or concepts are provided), it returns a placeholder evaluation with pending: true,
 * which triggers the asynchronous evaluation process in the component. If no AI configuration is present, it returns a default correct evaluation.
 * @param question The TextQuestion object containing the question statement and AI evaluation configuration.
 * @returns A TextEvaluation object representing either the placeholder for pending AI evaluation or the default correct evaluation.
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
