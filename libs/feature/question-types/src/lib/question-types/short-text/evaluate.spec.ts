import { evaluateShortText } from "./evaluate";
import { ShortText } from "./schema";

describe("evaluateShortText", () => {
	const defaultQuestion: ShortText["question"] = {
		type: "short-text",
		questionId: "question-id",
		hints: [],
		statement: "Test Question",
		withCertainty: false,
		acceptedAnswers: []
	};

	const defaultAnswer: ShortText["answer"] = {
		type: "short-text",
		questionId: "question-id",
		value: ""
	};

	it("Single accepted answer + correct answer -> Correct", () => {
		const acceptedAnswer: ShortText["question"]["acceptedAnswers"][0] = {
			value: "accepted answer",
			acceptedAnswerId: "accepted-answer-id"
		};

		const question: ShortText["question"] = {
			...defaultQuestion,
			acceptedAnswers: [acceptedAnswer]
		};

		const answer: ShortText["answer"] = {
			...defaultAnswer,
			value: acceptedAnswer.value
		};

		const result = evaluateShortText(question, answer);

		expect(result.isCorrect).toEqual(true);
		expect(result.acceptedAnswerId).toEqual("accepted-answer-id");
	});

	it("Multiple accepted answers + correct answer -> Correct", () => {
		const acceptedAnswer1: ShortText["question"]["acceptedAnswers"][0] = {
			value: "accepted answer 1",
			acceptedAnswerId: "accepted-answer-id-1"
		};

		const acceptedAnswer2: ShortText["question"]["acceptedAnswers"][0] = {
			value: "accepted answer 2",
			acceptedAnswerId: "accepted-answer-id-2"
		};

		const question: ShortText["question"] = {
			...defaultQuestion,
			acceptedAnswers: [acceptedAnswer1, acceptedAnswer2]
		};

		const answer: ShortText["answer"] = {
			...defaultAnswer,
			value: acceptedAnswer2.value
		};

		const result = evaluateShortText(question, answer);

		expect(result.isCorrect).toEqual(true);
		expect(result.acceptedAnswerId).toEqual(acceptedAnswer2.acceptedAnswerId);
	});

	it("No accepted answers -> Incorrect", () => {
		const question: ShortText["question"] = {
			...defaultQuestion,
			acceptedAnswers: []
		};

		const answer: ShortText["answer"] = {
			...defaultAnswer,
			value: "answer"
		};

		const result = evaluateShortText(question, answer);

		expect(result.isCorrect).toEqual(false);
		expect(result.acceptedAnswerId).toEqual(null);
	});

	it("Multiple accepted answers + incorrect answer -> Incorrect", () => {
		const acceptedAnswer1: ShortText["question"]["acceptedAnswers"][0] = {
			value: "accepted answer 1",
			acceptedAnswerId: "accepted-answer-id-1"
		};

		const acceptedAnswer2: ShortText["question"]["acceptedAnswers"][0] = {
			value: "accepted answer 2",
			acceptedAnswerId: "accepted-answer-id-2"
		};

		const question: ShortText["question"] = {
			...defaultQuestion,
			acceptedAnswers: [acceptedAnswer1, acceptedAnswer2]
		};

		const answer: ShortText["answer"] = {
			...defaultAnswer,
			value: "incorrect"
		};

		const result = evaluateShortText(question, answer);

		expect(result.isCorrect).toEqual(false);
		expect(result.acceptedAnswerId).toEqual(null);
	});
});
