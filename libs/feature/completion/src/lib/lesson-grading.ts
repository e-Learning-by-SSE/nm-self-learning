/**
 * To increase development speed, the evaluation of lessons is encapsulated here.
 * An alternative implementation would be to pack the logic into the individual QuestionTypes. Each QuestionType can then decide for itself what counts as an attempt and how to weight the score.
 * and how many attempts are necessary to calculate a score. Also the weighting no longer has to be done centrally.
 *
 * Only the translation from threshold to grade remains centralize then.
 */

import { QuestionType } from "@self-learning/question-types";
import { QuizContextValue } from "@self-learning/quiz";
import { PerformanceGrade } from "@self-learning/types";

// Weights for each question type used for grading
const QUESTION_TYPE_WEIGHTS: { [QType in QuestionType["type"]]: number } = {
	"multiple-choice": 0.7,
	text: 1,
	exact: 1,
	programming: 0.05,
	cloze: 0.5,
	arrange: 0.4,
	"language-tree": 0.3
};

export const GRADE_THRESHOLD = [
	{ grade: "PERFECT", threshold: 0.99 },
	{ grade: "VERY_GOOD", threshold: 0.85 },
	{ grade: "GOOD", threshold: 0.7 },
	{ grade: "SATISFACTORY", threshold: 0.55 },
	{ grade: "SUFFICIENT", threshold: 0 } // Default grade
];

// Maximale Versuche bis Penalty greift
const MAX_ATTEMPTS_BEFORE_PENALTY = 3;

/**
 * Berechnet den durchschnittlichen Score basierend auf Versuchen und Antworten.
 */
export function calculateAverageScore(
	attempts: QuizContextValue["attempts"],
	answers: QuizContextValue["answers"]
): number {
	const questionIds = Object.keys(attempts);
	if (questionIds.length === 0) return 0;

	let totalScore = 0;

	for (const questionId of questionIds) {
		const attemptCount = attempts[questionId];
		const questionType = answers[questionId]?.type;

		if (!questionType || attemptCount === 0) continue;

		// Score für einzelne Frage berechnen
		let score = 1.0;

		if (attemptCount > 1) {
			// Gewichtung basierend auf Fragentyp
			const weight = QUESTION_TYPE_WEIGHTS[questionType] || 0.5;

			// Penalty-Berechnung
			score = Math.pow(0.7, (attemptCount - 1) * weight);

			// Zusätzliche Penalty nach MAX_ATTEMPTS_BEFORE_PENALTY
			if (attemptCount > MAX_ATTEMPTS_BEFORE_PENALTY) {
				const extraPenalty = Math.pow(0.5, attemptCount - MAX_ATTEMPTS_BEFORE_PENALTY);
				score = Math.max(0.1, score * extraPenalty); // Minimum 10%
			} else {
				score = Math.max(0.2, score); // Minimum 20%
			}
		}

		totalScore += score;
	}

	const answeredQuestions = questionIds.filter(
		id => attempts[id] > 0 && answers[id]?.type
	).length;

	return answeredQuestions > 0 ? totalScore / answeredQuestions : 0;
}

/**
 * Berechnet die Gesamtnote basierend auf dem durchschnittlichen Score.
 */
export function calculateQuizGrade(averageScore: number): PerformanceGrade {
	for (const { grade, threshold } of GRADE_THRESHOLD) {
		if (averageScore >= threshold) {
			return grade as PerformanceGrade;
		}
	}

	// Fallback (should never be reached)
	return "SUFFICIENT";
}
