import { EvaluationFn } from "../../question-type-registry";

export const evaluateExactAnswer: EvaluationFn<"exact"> = (question, answer) => {
	const correctAnswer = question.acceptedAnswers.find(a => a.value === answer.value);

	return {
		isCorrect: !!correctAnswer,
		acceptedAnswerId: correctAnswer ? correctAnswer.acceptedAnswerId : null
	};
};
