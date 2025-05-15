/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createBaseQuestion } from "@self-learning/question-types";
import { evaluateLanguageTreeAnswer } from "./evaluate";
import { parseTree } from "./tree-parser";
import { serializeTree } from "./TreeEditor";

describe("evaluateLanguageTreeAnswer", () => {
	const defaultQuestion = {
		...createBaseQuestion(),
		type: "language-tree" as const,
		questionId: "question-id",
		caseSensitive: false,
		answer: ["[S [NP [ART [the]] [NN [cat]]] [VP [V [sleeps]]]]"],
		initialTree: "[S [NP [ART [the]] [NN [cat]]] [VP [V [sleeps]]]]"
	};

	it("Correct answer -> isCorrect = true", () => {
		const answer = {
			type: "language-tree" as const,
			questionId: "question-id",
			value: "[S [NP [ART [the]] [NN [cat]]] [VP [V [sleeps]]]]"
		};

		const result = evaluateLanguageTreeAnswer(defaultQuestion, answer);
		expect(result.isCorrect).toBe(true);
	});

	it("Incorrect answer -> isCorrect = false", () => {
		const answer = {
			type: "language-tree" as const,
			questionId: "question-id",
			value: "[S [NP [ART [a]] [NN [dog]]] [VP [V [runs]]]]"
		};

		const result = evaluateLanguageTreeAnswer(defaultQuestion, answer);
		expect(result.isCorrect).toBe(false);
	});

	it("Case insensitive evaluation", () => {
		const question = { ...defaultQuestion, caseSensitive: false };
		const answer = {
			type: "language-tree" as const,
			questionId: "question-id",
			value: "[s [np [art [the]] [nn [cat]]] [vp [v [sleeps]]]]"
		};

		const result = evaluateLanguageTreeAnswer(question, answer);
		expect(result.isCorrect).toBe(true);
	});

	it("Case sensitive evaluation", () => {
		const question = { ...defaultQuestion, caseSensitive: true };
		const answer = {
			type: "language-tree" as const,
			questionId: "question-id",
			value: "[s [np [art [the]] [nn [cat]]] [vp [v [sleeps]]]]"
		};

		const result = evaluateLanguageTreeAnswer(question, answer);
		expect(result.isCorrect).toBe(false);
	});

	it("Correct Answer but with extra spaces", () => {
		const answer = {
			type: "language-tree" as const,
			questionId: "question-id",
			value: "[S [NP [ART [the]] [NN [cat]]]  [VP  [V  [sleeps]]]]"
		};

		const result = evaluateLanguageTreeAnswer(defaultQuestion, answer);
		expect(result.isCorrect).toBe(true);
	}
	);

	it("Correct Answer but without spaces", () => {
		const answer = {
			type: "language-tree" as const,
			questionId: "question-id",
			value: "[S[NP[ART[the]][NN[cat]]][VP[V[sleeps]]]]"
		};

		const result = evaluateLanguageTreeAnswer(defaultQuestion, answer);
		expect(result.isCorrect).toBe(true);
	}
	);
});

describe("Tree parsing and serialization", () => {
	it("Parse and serialize a tree", () => {
		const input = "[S [NP [ART [the]] [NN [cat]]] [VP [V [sleeps]]]]";
		const tree = parseTree(input);
		expect(tree).not.toBeNull();
        
		const serialized = serializeTree(tree!);
		expect(serialized).toBe(input);
	});

	it("Missing brackets around words", () => {
		const input = "[S [NP [ART the] [NN cat]] [VP [V sleeps]]]";
		expect(() => parseTree(input)).toThrow("Unexpected inline text at position 12. Expected '[' or ']'");
	});

	it("Invalid tree structure throws error", () => {
		const input = "[S [NP [ART [the] [NN [cat]]] [VP [V [sleeps]]]]"; // Missing closing bracket
		expect(() => parseTree(input)).toThrow("Expected ']' at position");
	});

	it("Validate round-trip parsing and serialization", () => {
		const input = "[S [NP [ART [the]] [NN [cat]]] [VP [V [sleeps]]]]";
		const tree = parseTree(input);
		const serialized = serializeTree(tree!);
		const reparsedTree = parseTree(serialized);

		expect(reparsedTree).toEqual(tree);
	});
});
