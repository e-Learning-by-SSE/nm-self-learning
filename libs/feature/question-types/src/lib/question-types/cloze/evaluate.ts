import { EvaluationFn } from "../../question-type-registry";
import { parseCloze } from "./cloze-parser";

export const evaluateCloze: EvaluationFn<"cloze"> = (question, answer) => {
	const { clozeText } = question;
	const { value } = answer;

	const gaps = parseCloze(clozeText);

	const result = {
		...answer,
		value: gaps.map((gap, index) => {
			const studentAnswer = value[index] ?? "";
			const studentAnswerLowercase = studentAnswer.trim().toLowerCase();

			const intendedAnswers = gap.values.filter(v => v.isCorrect).map(v => v.text);

			const isCorrect = intendedAnswers.some(
				text => text.toLocaleLowerCase() === studentAnswerLowercase
			);

			return {
				isCorrect,
				studentAnswer,
				index,
				intendedAnswers
			};
		})
	};

	const incorrectAnswers = result.value
		.filter(v => !v.isCorrect)
		.map(v => ({
			index: v.index,
			studentAnswer: v.studentAnswer,
			intendedAnswers: v.intendedAnswers
		}));

	return { isCorrect: result.value.every(v => v.isCorrect), incorrectAnswers };
};
