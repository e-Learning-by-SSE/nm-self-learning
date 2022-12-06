import { EvaluationFn } from "../../quiz-schema";
import { TestCase } from "./schema";

export const evaluateProgramming: EvaluationFn<"programming"> = (question, answer) => {
	// Signal = null means that the program was executed successfully
	// Code = null means that the program was not executed
	// Code = 1 means that the program was executed but it failed
	if (answer.value.signal !== null || answer.value.code === null || answer.value.code === 1) {
		return {
			isCorrect: false,
			testCases: []
		};
	}

	if (question.custom.mode === "standalone") {
		const actual = answer.value.stdout.trim();
		const expected = question.custom.expectedOutput.trim();

		const verdict = actual === expected;
		return {
			isCorrect: verdict,
			testCases: [
				{
					title: "",
					actual: actual.split("\n"),
					expected: expected.split("\n"),
					verdict: verdict
				}
			]
		};
	}

	if (question.custom.mode === "callable") {
		const testCases = parseTestCases(answer.value.stdout.trim());

		return {
			isCorrect: testCases.every(c => c.verdict === true),
			testCases: testCases
		};
	}

	return {
		isCorrect: false,
		testCases: []
	};
};

export function parseTestCases(stdout: string): TestCase[] {
	const testCases: TestCase[] = [];

	const lines = stdout.split("\n");

	let index = 0;

	while (index < lines.length) {
		const line = lines[index];
		if (line.startsWith("### TEST")) {
			testCases.push({
				title: "",
				actual: [],
				expected: [],
				verdict: false
			});
			const testTitle = collectLinesUntilSeparator(lines, index + 1);
			testCases[testCases.length - 1].title = testTitle.join(", ");
			index += testTitle.length;
		} else if (line.startsWith("### EXPECTED")) {
			testCases[testCases.length - 1].expected = collectLinesUntilSeparator(lines, index + 1);
			index += testCases[testCases.length - 1].expected.length;
		} else if (line.startsWith("### ACTUAL")) {
			testCases[testCases.length - 1].actual = collectLinesUntilSeparator(lines, index + 1);
			index += testCases[testCases.length - 1].actual.length;
		}

		index++;
	}

	for (const testCase of testCases) {
		let verdict = true;

		if (testCase.expected.length !== testCase.actual.length) {
			verdict = false;
			continue;
		}

		for (let i = 0; i < testCase.expected.length; i++) {
			if (testCase.expected[i] !== testCase.actual[i]) {
				verdict = false;
				break;
			}
		}

		testCase.verdict = verdict;
	}

	return testCases;
}

function collectLinesUntilSeparator(lines: string[], startAt: number): string[] {
	const result: string[] = [];
	for (let i = startAt; i < lines.length; i++) {
		const line = lines[i];
		if (line.startsWith("###")) {
			break;
		}
		result.push(line);
	}
	return result;
}
