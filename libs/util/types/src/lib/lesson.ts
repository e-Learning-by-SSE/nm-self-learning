import { z } from "zod";
import { lessonContentSchema } from "./lesson-content";

export const lessonSchema = z.object({
	lessonId: z.string().nullable(),
	slug: z.string().min(3),
	title: z.string().min(3),
	subtitle: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	imgUrl: z.string().nullable().optional(),
	content: z.array(lessonContentSchema),
	quiz: z.array(z.any()) //TODO: quizContentSchema causes "Jest failed to parse a file"
});

export type Lesson = z.infer<typeof lessonSchema>;

/** Returns a {@link Lesson} object with empty/null values.  */
export function createEmptyLesson(): Lesson {
	return {
		lessonId: null,
		slug: "",
		title: "",
		subtitle: null,
		description: null,
		imgUrl: null,
		content: [],
		quiz: []
	};
}
