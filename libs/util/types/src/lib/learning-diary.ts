import { z } from "zod";

export const techniqueRatingSchema = z.object({
	id: z.string().uuid(),
	score: z.number().int(),
	learningTechniqueId: z.string(),
	learningDiaryEntryId: z.string(),
	creatorName: z.string()
});

export const learningGoalSchema: z.ZodSchema = z.lazy(() =>
	z.object({
		id: z.string().optional(),
		learningDiaryEntryId: z.string().uuid().optional(),
		parentGoalId: z.string().nullable().optional(),
		childGoals: z.array(z.lazy(() => learningGoalSchema)).optional()
	})
);

export const learningLocationSchema = z.object({
	name: z.string(),
	iconURL: z.string().optional(),
	defaultLocation: z.boolean().optional()
});

export const learningDiaryPageSchema = z.object({
	id: z.string(),
	notes: z.string().optional(),
	scope: z.number().optional(),
	effortLevel: z.number().int().optional(),
	distractionLevel: z.number().int().optional(),
	learningLocation: learningLocationSchema.optional(),
	learningGoals: z.array(learningGoalSchema).optional(),
	techniqueRatings: z.array(techniqueRatingSchema).optional()
});

export type LearningDiaryPage = z.infer<typeof learningDiaryPageSchema>;

export const lessonStartSchema = z.object({
	entryId: z.string(),
	lessonId: z.string()
});
