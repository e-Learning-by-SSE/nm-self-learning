import { z } from "zod";

export const techniqueEvaluationSchema = z.object({
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
	id: z.string().optional().nullable(),
	name: z.string(),
	iconURL: z.string(),
	defaultLocation: z.boolean().default(false),
	creatorName: z.string().optional().nullable()
});

export const learningDiaryPageSchema = z.object({
	id: z.string(),
	notes: z.string().optional(),
	effortLevel: z.number().int().optional(),
	distractionLevel: z.number().int().optional(),
	// learningLocation: learningLocationSchema.optional(),
	learningLocationId: z.string().optional(),
	learningGoals: z.array(learningGoalSchema).optional(),
	learningTechniqueEvaluation: z.array(techniqueEvaluationSchema).optional()
});

export type LearningDiaryPage = z.infer<typeof learningDiaryPageSchema>;

export const lessonStartSchema = z.object({
	entryId: z.string(),
	lessonId: z.string()
});
