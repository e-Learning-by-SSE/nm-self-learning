import { quizSchema } from "./quiz";

describe("quizSchema question order", () => {
	const question = {
		type: "multiple-choice",
		questionId: "q1",
		statement: "Which answer is correct?",
		answers: [{ answerId: "a1", content: "Correct answer", isCorrect: true }],
		hints: [],
		withCertainty: false,
		questionStep: 1
	};

	it("accepts an empty quiz without a question order and normalizes it", () => {
		// Verify
		expect(quizSchema.parse({ questions: [] })).toEqual({
			questions: [],
			questionOrder: []
		});
	});

	it("accepts an empty quiz with an empty question order", () => {
		// Verify
		expect(quizSchema.safeParse({ questions: [], questionOrder: [] }).success).toBe(true);
	});

	it.each([undefined, []])("rejects a nonempty quiz with questionOrder %j", questionOrder => {
		// Exercise
		const result = quizSchema.safeParse({ questions: [question], questionOrder });

		// Verify
		expect(result.success).toBe(false);
		expect(result.error?.issues).toEqual(
			expect.arrayContaining([expect.objectContaining({ path: ["questionOrder"] })])
		);
	});

	it("accepts a nonempty quiz with a question order", () => {
		// Verify
		expect(quizSchema.safeParse({ questions: [question], questionOrder: ["q1"] }).success).toBe(
			true
		);
	});
});
