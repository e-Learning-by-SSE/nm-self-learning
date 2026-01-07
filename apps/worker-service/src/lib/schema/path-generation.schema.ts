import { z } from "zod";

const skillSchema = z.object({
	id: z.string(),
	repositoryId: z.string(),
	children: z.array(z.object({ id: z.string() })).optional()
});

const learningUnitSchema = z.object({
	lessonId: z.string(),
	requires: z.array(z.object({ id: z.string() })).optional(),
	provides: z.array(z.object({ id: z.string() })).optional()
});

export const pathGenerationPayloadSchema = z.object({
	dbSkills: z.array(skillSchema),
	userGlobalKnowledge: z
		.object({
			received: z.array(z.object({ id: z.string() })).optional()
		})
		.optional(),
	course: z.object({
		teachingGoals: z.array(skillSchema).optional()
	}),
	lessons: z.array(learningUnitSchema),
	knowledge: z.array(z.string()).optional()
});
