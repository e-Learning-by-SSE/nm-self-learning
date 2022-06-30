import { EvaluationFn } from "../../quiz-schema";

export const evaluateShortText: EvaluationFn<"short-text"> = (question, answer) => {
	const correctAnswer = question.acceptedAnswers.find(a => a.value === answer.value);

	return {
		isCorrect: !!correctAnswer,
		acceptedAnswerId: correctAnswer ? correctAnswer.acceptedAnswerId : null
	};
};
