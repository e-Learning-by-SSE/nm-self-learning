import { z } from "zod";

export const learningTechniqueEvaluationSchema = z.object({
	id: z.string().optional(),
	score: z.number().int().optional(),
	learningStrategieId: z.string().optional(),
	learningTechniqueId: z.string().optional(),
	learningDiaryEntryId: z.string().optional()
});

export const learningGoalSchema: z.ZodSchema = z.lazy(() =>
	z.object({
		id: z.string().optional(),
		learningDiaryEntryId: z.string().uuid().optional(),
		parentGoalId: z.string().nullable().optional(),
		childGoals: z.array(z.lazy(() => learningGoalSchema)).optional()
	})
);

export const learningDiaryEntrySchema = z.object({
	id: z.string().optional(),
	semesterId: z.string().optional(),
	studentName: z.string().optional(),
	courseSlug: z.string().optional(),
	notes: z.string().optional(),
	date: z.date().optional(),
	start: z.date().optional(),
	end: z.date().optional(),
	scope: z.number().int().optional(),
	effortLevel: z.number().int().optional(),
	distractionLevel: z.number().int().optional(),
	learningLocationId: z.string().optional(),
	learningGoals: z.array(learningGoalSchema).optional(),
	learningTechniqueEvaluation: z.array(learningTechniqueEvaluationSchema).optional()
});

export const learningLocationSchema = z.object({
	id: z.string().optional().nullable(),
	name: z.string(),
	iconURL: z.string(),
	defaultLocation: z.boolean().default(false),
	creatorName: z.string().optional().nullable()
});

export type LearningTechniqueEvaluation = z.infer<typeof learningTechniqueEvaluationSchema>;
export type LearningGoal = z.infer<typeof learningGoalSchema>;
export type LearningDiaryEntry = z.infer<typeof learningDiaryEntrySchema>;
