import { z } from "zod";

export const techniqueRatingSchema = z.object({
	id: z.string().uuid(),
	score: z.number().int(),
	learningTechniqueId: z.string(),
	learningDiaryEntryId: z.string(),
	creatorName: z.string()
});

const learningGoalStatusSchema = z.enum(["ACTIVE", "INACTIVE", "COMPLETED"]);

const learningSubGoalSchema = z.object({
	id: z.string().cuid(),
	description: z.string().min(1),
	status: learningGoalStatusSchema.default("INACTIVE"),
	priority: z.number().int(),
	learningGoalId: z.string().cuid()
});

const learningGoalSchema = z.object({
	id: z.string().cuid(),
	description: z.string().min(1),
	status: learningGoalStatusSchema.default("INACTIVE"),
	learningSubGoals: z.array(learningSubGoalSchema)
});

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
