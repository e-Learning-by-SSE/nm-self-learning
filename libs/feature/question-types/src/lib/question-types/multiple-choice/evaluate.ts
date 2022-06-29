import { MultipleChoiceAnswer, MultipleChoiceEvaluation, MultipleChoiceQuestion } from "./schema";

export function evaluateMultipleChoice(
	question: MultipleChoiceQuestion,
	answer: MultipleChoiceAnswer
): MultipleChoiceEvaluation {
	const evaluatedAnswers: { [answerId: string]: boolean } = {};

	for (const option of question.answers) {
		evaluatedAnswers[option.answerId] = answer.value[option.answerId] === option.isCorrect;
	}

	return {
		answers: evaluatedAnswers,
		isCorrect: Object.values(evaluatedAnswers).every(x => x === true),
		errorCount: Object.values(evaluatedAnswers).filter(x => x === false).length
	};
}
