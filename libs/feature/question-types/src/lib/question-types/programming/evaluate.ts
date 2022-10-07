import { EvaluationFn } from "../../quiz-schema";
import { TestCase } from "./schema";

export const evaluateProgramming: EvaluationFn<"programming"> = (question, answer) => {
	if (question.custom.mode === "standalone") {
		return {
			isCorrect: answer.value.stdout === question.custom.expectedOutput,
			testCases: []
		};
	}

	if (question.custom.mode === "callable") {
		return {
			isCorrect: false,
			testCases: parseTestCases(answer.value.stdout)
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
