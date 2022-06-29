import { z } from "zod";
import { baseQuestionSchema } from "../../base-question";

export const clozeQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("cloze"),
	textArray: z.array(z.string())
});

export type ClozeQuestion = z.infer<typeof clozeQuestionSchema>;
