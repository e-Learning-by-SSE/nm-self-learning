import z from "zod";

export const lessonPollCreationSchema = z.object({
	id: z.string(),
	courseId: z.string(),
	teachingGoals: z.array(z.string()),
	lessons: z.array(z.string())
});
