import { EvaluationFn } from "../../question-type-registry";
import { ArrangeItem } from "./schema";

export const evaluateArrange: EvaluationFn<"arrange"> = (question, answer) => {
	const { value: studentAnswer } = answer;
	const { items: correctAnswer } = question;

	const feedback: Record<
		string,
		{ isCorrect: boolean; missing: ArrangeItem[]; extra: ArrangeItem[] }
	> = {};

	for (const [containerId, correctItems] of Object.entries(correctAnswer)) {
		const studentItems = studentAnswer[containerId];

		const missing: ArrangeItem[] = correctItems.filter(
			item => !studentItems.find(i => item.id === i.id)
		);
		const extra: ArrangeItem[] = studentItems.filter(
			item => !correctItems.find(i => item.id === i.id)
		);

		feedback[containerId] = {
			isCorrect: missing.length === 0 && extra.length === 0,
			missing,
			extra
		};
	}

	return {
		isCorrect: Object.values(feedback).every(fb => fb.isCorrect),
		feedback
	};
};
