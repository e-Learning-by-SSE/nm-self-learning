import { createBaseQuestion } from "../../base-question";
import { evaluateArrange } from "./evaluate";
import { Arrange } from "./schema";

describe("evaluateArrange", () => {
	it("Correct + same order -> isCorrect = true", () => {
		const items: Arrange["question"]["items"] = {
			Even: [
				{ id: "a", content: "2" },
				{ id: "b", content: "4" }
			],
			Odd: [
				{ id: "d", content: "1" },
				{ id: "e", content: "3" }
			]
		};

		const question: Arrange["question"] = {
			...createBaseQuestion(),
			type: "arrange",
			items
		};

		const answer: Arrange["answer"] = {
			type: "arrange",
			value: {
				...items,
				_init: []
			}
		};

		const result = evaluateArrange(question, answer);
		expect(result.isCorrect).toEqual(true);
		expect(result).toMatchInlineSnapshot(`
		Object {
		  "feedback": Object {
		    "Even": Object {
		      "extra": Array [],
		      "isCorrect": true,
		      "missing": Array [],
		    },
		    "Odd": Object {
		      "extra": Array [],
		      "isCorrect": true,
		      "missing": Array [],
		    },
		  },
		  "isCorrect": true,
		}
	`);
	});

	it("Correct + different order -> isCorrect = true", () => {
		const items: Arrange["question"]["items"] = {
			Even: [
				{ id: "a", content: "2" },
				{ id: "b", content: "4" }
			],
			Odd: [
				{ id: "d", content: "1" },
				{ id: "e", content: "3" }
			]
		};

		const question: Arrange["question"] = {
			...createBaseQuestion(),
			type: "arrange",
			items
		};

		const answer: Arrange["answer"] = {
			type: "arrange",
			value: {
				Odd: [
					{ id: "e", content: "3" },
					{ id: "d", content: "1" }
				],
				_init: [],
				Even: [
					{ id: "b", content: "4" },
					{ id: "a", content: "2" }
				]
			}
		};

		const result = evaluateArrange(question, answer);
		expect(result.isCorrect).toEqual(true);
		expect(result).toMatchInlineSnapshot(`
		Object {
		  "feedback": Object {
		    "Even": Object {
		      "extra": Array [],
		      "isCorrect": true,
		      "missing": Array [],
		    },
		    "Odd": Object {
		      "extra": Array [],
		      "isCorrect": true,
		      "missing": Array [],
		    },
		  },
		  "isCorrect": true,
		}
	`);
	});

	it("Missing item -> isCorrect = false", () => {
		const question: Arrange["question"] = {
			...createBaseQuestion(),
			type: "arrange",
			items: {
				Even: [
					{ id: "a", content: "2" },
					{ id: "b", content: "4" }
				],
				Odd: [
					{ id: "d", content: "1" },
					{ id: "e", content: "3" }
				]
			}
		};

		const answer: Arrange["answer"] = {
			type: "arrange",
			value: {
				_init: [],
				Even: [{ id: "b", content: "4" }],
				Odd: [
					{ id: "e", content: "3" },
					{ id: "d", content: "1" }
				]
			}
		};

		const result = evaluateArrange(question, answer);
		expect(result.isCorrect).toEqual(false);
		expect(result.feedback["Even"].isCorrect).toEqual(false);
		expect(result.feedback["Even"].missing).toHaveLength(1);
		expect(result).toMatchInlineSnapshot(`
		Object {
		  "feedback": Object {
		    "Even": Object {
		      "extra": Array [],
		      "isCorrect": false,
		      "missing": Array [
		        Object {
		          "content": "2",
		          "id": "a",
		        },
		      ],
		    },
		    "Odd": Object {
		      "extra": Array [],
		      "isCorrect": true,
		      "missing": Array [],
		    },
		  },
		  "isCorrect": false,
		}
	`);
	});

	it("Extra item -> isCorrect = false", () => {
		const question: Arrange["question"] = {
			...createBaseQuestion(),
			type: "arrange",
			items: {
				Even: [
					{ id: "a", content: "2" },
					{ id: "b", content: "4" }
				],
				Odd: [
					{ id: "d", content: "1" },
					{ id: "e", content: "3" }
				]
			}
		};

		const answer: Arrange["answer"] = {
			type: "arrange",
			value: {
				_init: [],
				Even: [
					{ id: "a", content: "2" },
					{ id: "b", content: "4" },
					{ id: "x", content: "7" }
				],
				Odd: [
					{ id: "e", content: "3" },
					{ id: "d", content: "1" }
				]
			}
		};

		const result = evaluateArrange(question, answer);
		expect(result.isCorrect).toEqual(false);
		expect(result.feedback["Even"].isCorrect).toEqual(false);
		expect(result.feedback["Even"].extra).toHaveLength(1);
		expect(result).toMatchInlineSnapshot(`
		Object {
		  "feedback": Object {
		    "Even": Object {
		      "extra": Array [
		        Object {
		          "content": "7",
		          "id": "x",
		        },
		      ],
		      "isCorrect": false,
		      "missing": Array [],
		    },
		    "Odd": Object {
		      "extra": Array [],
		      "isCorrect": true,
		      "missing": Array [],
		    },
		  },
		  "isCorrect": false,
		}
	`);
	});

	it("Switched items (missing and extra) -> isCorrect = false", () => {
		const question: Arrange["question"] = {
			...createBaseQuestion(),
			type: "arrange",
			items: {
				Even: [
					{ id: "a", content: "2" },
					{ id: "b", content: "4" }
				],
				Odd: [
					{ id: "d", content: "1" },
					{ id: "e", content: "3" }
				]
			}
		};

		const answer: Arrange["answer"] = {
			type: "arrange",
			value: {
				_init: [],
				Even: [
					{ id: "a", content: "2" },
					{ id: "e", content: "3" }
				],
				Odd: [
					{ id: "b", content: "4" },
					{ id: "d", content: "1" }
				]
			}
		};

		const result = evaluateArrange(question, answer);
		expect(result.isCorrect).toEqual(false);
		expect(result).toMatchInlineSnapshot(`
		Object {
		  "feedback": Object {
		    "Even": Object {
		      "extra": Array [
		        Object {
		          "content": "3",
		          "id": "e",
		        },
		      ],
		      "isCorrect": false,
		      "missing": Array [
		        Object {
		          "content": "4",
		          "id": "b",
		        },
		      ],
		    },
		    "Odd": Object {
		      "extra": Array [
		        Object {
		          "content": "4",
		          "id": "b",
		        },
		      ],
		      "isCorrect": false,
		      "missing": Array [
		        Object {
		          "content": "3",
		          "id": "e",
		        },
		      ],
		    },
		  },
		  "isCorrect": false,
		}
	`);
	});
});
