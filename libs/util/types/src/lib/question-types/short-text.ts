import { z } from "zod";
import { baseQuestionSchema } from "../base-question";

export const shortTextQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("short-text"),
	acceptedAnswers: z.array(
		z.object({
			acceptedAnswerId: z.string(),
			value: z.string()
		})
	)
});

export type ShortTextQuestion = z.infer<typeof shortTextQuestionSchema>;
