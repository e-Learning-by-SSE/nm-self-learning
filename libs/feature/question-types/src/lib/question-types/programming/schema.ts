import { z } from "zod";
import { BaseEvaluation, baseQuestionSchema } from "../../base-question";

export const programmingQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("programming"),
	language: z.string(),
	custom: z.discriminatedUnion("mode", [
		z.object({
			mode: z.literal("standalone"),
			solutionTemplate: z.string(),
			expectedOutput: z.string()
		}),
		z.object({
			mode: z.literal("callable"),
			mainFile: z.string(),
			solutionTemplate: z.string()
		})
	])
});

export type ProgrammingQuestion = z.infer<typeof programmingQuestionSchema>;

export type Programming = {
	type: "programming";
	question: ProgrammingQuestion;
	answer: {
		type: "programming";
		value: {
			/** The program written by a student. */
			solution: string;
			stdout: string;
			signal: string | null;
			/** Exit code of the program. `0` = success, `1` = error */
			code: number | null;
		};
	};
	evaluation: BaseEvaluation & {
		testCases: TestCase[];
	};
};

export type TestCase = {
	title: string;
	actual: string[];
	expected: string[];
	verdict: boolean;
};
