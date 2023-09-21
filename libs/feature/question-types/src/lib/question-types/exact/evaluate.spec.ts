import { evaluateExactAnswer } from "./evaluate";
import { Exact } from "./schema";

describe("evaluateExact", () => {
	const defaultQuestion: Exact["question"] = {
		type: "exact",
		questionId: "question-id",
		hints: [],
		statement: "Test Question",
		withCertainty: false,
		caseSensitive: false,
		acceptedAnswers: []
	};

	const defaultAnswer: Exact["answer"] = {
		type: "exact",
		questionId: "question-id",
		value: ""
	};

	it("Single accepted answer + correct answer -> Correct", () => {
		const acceptedAnswer: Exact["question"]["acceptedAnswers"][0] = {
			value: "accepted answer",
			acceptedAnswerId: "accepted-answer-id"
		};

		const question: Exact["question"] = {
			...defaultQuestion,
			acceptedAnswers: [acceptedAnswer]
		};

		const answer: Exact["answer"] = {
			...defaultAnswer,
			value: acceptedAnswer.value
		};

		const result = evaluateExactAnswer(question, answer);

		expect(result.isCorrect).toEqual(true);
		expect(result.acceptedAnswerId).toEqual("accepted-answer-id");
	});

	it("Multiple accepted answers + correct answer -> Correct", () => {
		const acceptedAnswer1: Exact["question"]["acceptedAnswers"][0] = {
			value: "accepted answer 1",
			acceptedAnswerId: "accepted-answer-id-1"
		};

		const acceptedAnswer2: Exact["question"]["acceptedAnswers"][0] = {
			value: "accepted answer 2",
			acceptedAnswerId: "accepted-answer-id-2"
		};

		const question: Exact["question"] = {
			...defaultQuestion,
			acceptedAnswers: [acceptedAnswer1, acceptedAnswer2]
		};

		const answer: Exact["answer"] = {
			...defaultAnswer,
			value: acceptedAnswer2.value
		};

		const result = evaluateExactAnswer(question, answer);

		expect(result.isCorrect).toEqual(true);
		expect(result.acceptedAnswerId).toEqual(acceptedAnswer2.acceptedAnswerId);
	});

	it("No accepted answers -> Incorrect", () => {
		const question: Exact["question"] = {
			...defaultQuestion,
			acceptedAnswers: []
		};

		const answer: Exact["answer"] = {
			...defaultAnswer,
			value: "answer"
		};

		const result = evaluateExactAnswer(question, answer);

		expect(result.isCorrect).toEqual(false);
		expect(result.acceptedAnswerId).toEqual(null);
	});

	it("Multiple accepted answers + incorrect answer -> Incorrect", () => {
		const acceptedAnswer1: Exact["question"]["acceptedAnswers"][0] = {
			value: "accepted answer 1",
			acceptedAnswerId: "accepted-answer-id-1"
		};

		const acceptedAnswer2: Exact["question"]["acceptedAnswers"][0] = {
			value: "accepted answer 2",
			acceptedAnswerId: "accepted-answer-id-2"
		};

		const question: Exact["question"] = {
			...defaultQuestion,
			acceptedAnswers: [acceptedAnswer1, acceptedAnswer2]
		};

		const answer: Exact["answer"] = {
			...defaultAnswer,
			value: "incorrect"
		};

		const result = evaluateExactAnswer(question, answer);

		expect(result.isCorrect).toEqual(false);
		expect(result.acceptedAnswerId).toEqual(null);
	});
});
