import { z } from "zod";

export const learningTechniqueEvaluationSchema = z.object({
	id: z.string().optional(),
	score: z.number().int().optional(),
	learningStrategieId: z.string().optional(),
	learningTechniqueId: z.string().optional(),
	learningDiaryEntryId: z.string().optional()
});

const learningGoalStatusSchema = z.enum(["ACTIVE", "INACTIVE", "COMPLETED"]);

export const learningGoalSchema: z.ZodSchema = z.lazy(() =>
	z.object({
		id: z.string().optional(),
		description: z.string(),
		status: learningGoalStatusSchema.optional().default("INACTIVE"),
		createdAt: z.date().optional(),
		lastProgressUpdate: z.date().nullable().optional(),
		username: z.string(),
		student: z
			.object({
				connect: z.object({
					username: z.string()
				})
			})
			.optional(),
		learningSubGoals: z.array(z.lazy(() => learningSubGoalSchema)).optional(),
		learningDiaryEntry: z.array(z.string()).optional()
	})
);

export const learningSubGoalSchema: z.ZodSchema = z.lazy(() =>
	z.object({
		id: z.string().optional(),
		description: z.string(),
		status: learningGoalStatusSchema.optional().default("INACTIVE"),
		createdAt: z.date().optional(),
		lastProgressUpdate: z.date().nullable().optional(),
		priority: z.number().optional(),
		learningGoalId: z.string(),
		learningGoal: z.lazy(() => learningGoalSchema).optional()
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
	learningGoal: z.array(learningGoalSchema).optional(),
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
export type LearningDiaryEntry = z.infer<typeof learningDiaryEntrySchema>;
