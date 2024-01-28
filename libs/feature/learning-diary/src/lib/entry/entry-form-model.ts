import { strategySchema } from "@self-learning/types";
import { z } from "zod";

export const entryFormSchema = z.object({
	id: z.string().nullable(),
	title: z.string(),
	distractions: z.number().nullable(),
	efforts: z.number().nullable(),
	notes: z.string().nullable(),
	lessonId: z.string().nullable(),
	completedLessonId: z.number().nullable(),
	duration: z.number().nullable(),
	learningStrategies: z.array(strategySchema).nullable()
});

export type EntryFormModel = z.infer<typeof entryFormSchema>;
