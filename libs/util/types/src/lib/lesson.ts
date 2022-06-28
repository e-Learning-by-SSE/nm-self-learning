import { z } from "zod";
import { lessonContentSchema } from "./lesson-content";
import { quizContentSchema } from "./quiz-schema";

export const lessonSchema = z.object({
	lessonId: z.string().nullable(),
	slug: z.string().min(3),
	title: z.string().min(3),
	subtitle: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	imgUrl: z.string().nullable().optional(),
	content: z.array(lessonContentSchema),
	quiz: z.array(quizContentSchema)
});

export type Lesson = z.infer<typeof lessonSchema>;
