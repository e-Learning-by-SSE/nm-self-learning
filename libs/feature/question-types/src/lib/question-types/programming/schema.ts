import { z } from "zod";
import { baseQuestionSchema } from "../../base-question";

export const programmingQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("programming"),
	language: z.string(),
	template: z.string(),
	expectedOutput: z.string()
});

export type ProgrammingQuestion = z.infer<typeof programmingQuestionSchema>;
