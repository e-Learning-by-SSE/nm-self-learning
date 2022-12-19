import { EvaluationFn } from "../../question-type-registry";

export const evaluateExactAnswer: EvaluationFn<"exact"> = (question, answer) => {
	let studentAnswer = answer.value.trim();
	let correctAnswer: typeof question["acceptedAnswers"][0] | undefined = undefined;

	if (question.caseSensitive) {
		correctAnswer = question.acceptedAnswers.find(a => a.value.trim() === studentAnswer);
	} else {
		studentAnswer = studentAnswer.toLowerCase();
		correctAnswer = question.acceptedAnswers.find(
			a => a.value.trim().toLowerCase() === studentAnswer
		);
	}

	return {
		isCorrect: !!correctAnswer,
		acceptedAnswerId: correctAnswer ? correctAnswer.acceptedAnswerId : null
	};
};
