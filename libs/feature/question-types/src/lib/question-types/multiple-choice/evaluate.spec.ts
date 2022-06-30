import { evaluateMultipleChoice } from "./evaluate";
import { MultipleChoice } from "./schema";

describe("evaluateMultipleChoice", () => {
	function createAnswers({ correct, incorrect }: { correct: string[]; incorrect: string[] }) {
		const answers = [
			...correct.map(a => ({ answerId: a, isCorrect: true, content: a })),
			...incorrect.map(a => ({ answerId: a, isCorrect: false, content: a }))
		];
		return answers;
	}

	const defaultQuestion: MultipleChoice["question"] = {
		type: "multiple-choice",
		questionId: "question-id",
		hints: [],
		statement: "Test Question",
		withCertainty: false,
		answers: []
	};

	const defaultAnswers: MultipleChoice["answer"] = {
		type: "multiple-choice",
		questionId: "question-id",
		value: {}
	};

	it("Single true answer + correct answer selected -> Correct", () => {
		const question: MultipleChoice["question"] = {
			...defaultQuestion,
			answers: createAnswers({ correct: ["a"], incorrect: ["b", "c"] })
		};

		const answer: MultipleChoice["answer"] = {
			...defaultAnswers,
			value: { a: true }
		};

		const result = evaluateMultipleChoice(question, answer);

		expect(result.isCorrect).toEqual(true);
		expect(result).toMatchInlineSnapshot(`
		Object {
		  "answers": Object {
		    "a": true,
		    "b": true,
		    "c": true,
		  },
		  "errorCount": 0,
		  "isCorrect": true,
		}
	`);
	});

	it("Multiple correct answers + all correct answer selected -> Correct", () => {
		const question: MultipleChoice["question"] = {
			...defaultQuestion,
			answers: createAnswers({ correct: ["a", "b"], incorrect: ["c", "d"] })
		};

		const answer: MultipleChoice["answer"] = {
			...defaultAnswers,
			value: { a: true, b: true }
		};

		const result = evaluateMultipleChoice(question, answer);

		expect(result.isCorrect).toEqual(true);
		expect(result).toMatchInlineSnapshot(`
		Object {
		  "answers": Object {
		    "a": true,
		    "b": true,
		    "c": true,
		    "d": true,
		  },
		  "errorCount": 0,
		  "isCorrect": true,
		}
	`);
	});

	it("No correct answers + no answers selected -> Correct", () => {
		const question: MultipleChoice["question"] = {
			...defaultQuestion,
			answers: createAnswers({ correct: [], incorrect: ["a", "b", "c", "d"] })
		};

		const answer: MultipleChoice["answer"] = {
			...defaultAnswers,
			value: {}
		};

		const result = evaluateMultipleChoice(question, answer);

		expect(result.isCorrect).toEqual(true);
		expect(result).toMatchInlineSnapshot(`
		Object {
		  "answers": Object {
		    "a": true,
		    "b": true,
		    "c": true,
		    "d": true,
		  },
		  "errorCount": 0,
		  "isCorrect": true,
		}
	`);
	});

	it("Multiple correct answers + no answers selected -> Incorrect", () => {
		const question: MultipleChoice["question"] = {
			...defaultQuestion,
			answers: createAnswers({ correct: ["a", "b"], incorrect: ["c", "d"] })
		};

		const answer: MultipleChoice["answer"] = {
			...defaultAnswers,
			value: {}
		};

		const result = evaluateMultipleChoice(question, answer);

		expect(result.isCorrect).toEqual(false);
		expect(result).toMatchInlineSnapshot(`
		Object {
		  "answers": Object {
		    "a": false,
		    "b": false,
		    "c": true,
		    "d": true,
		  },
		  "errorCount": 2,
		  "isCorrect": false,
		}
	`);
	});

	it("Multiple correct answers + only one correct answers selected -> Incorrect", () => {
		const question: MultipleChoice["question"] = {
			...defaultQuestion,
			answers: createAnswers({ correct: ["a", "b"], incorrect: ["c", "d"] })
		};

		const answer: MultipleChoice["answer"] = {
			...defaultAnswers,
			value: { b: true }
		};

		const result = evaluateMultipleChoice(question, answer);

		expect(result.isCorrect).toEqual(false);
		expect(result).toMatchInlineSnapshot(`
		Object {
		  "answers": Object {
		    "a": false,
		    "b": true,
		    "c": true,
		    "d": true,
		  },
		  "errorCount": 1,
		  "isCorrect": false,
		}
	`);
	});
});
