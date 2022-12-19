import { EvaluationFn } from "../../question-type-registry";

export const evaluateMultipleChoice: EvaluationFn<"multiple-choice"> = (question, answer) => {
	const evaluatedAnswers: { [answerId: string]: boolean } = {};

	for (const option of question.answers) {
		evaluatedAnswers[option.answerId] =
			(answer.value[option.answerId] ?? false) === option.isCorrect;
	}

	return {
		answers: evaluatedAnswers,
		isCorrect: Object.values(evaluatedAnswers).every(x => x === true),
		errorCount: Object.values(evaluatedAnswers).filter(x => x === false).length
	};
};
