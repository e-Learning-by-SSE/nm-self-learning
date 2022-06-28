import { z } from "zod";
import { baseQuestionSchema } from "../base-question";
import { multipleChoiceAnswerSchema } from "./multiple-choice";

export const vorwissenQuestionSchema = baseQuestionSchema.extend({
	type: z.literal("vorwissen"),
	answers: z.array(multipleChoiceAnswerSchema),
	requireExplanationForAnswerIds: z.string()
});

export type VorwissenQuestion = z.infer<typeof vorwissenQuestionSchema>;
