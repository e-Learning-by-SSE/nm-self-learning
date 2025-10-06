import { LearningGoalStatus } from "@prisma/client";
import { z } from "zod";

export const techniqueRatingSchema = z.object({
	id: z.string().uuid(),
	score: z.number().int()
});

export const learningTechniqueCreateSchema = z.object({
	learningStrategieId: z.string().uuid(),
	name: z.string(),
	description: z.string().optional()
});

const learningGoalStatusSchema = z.nativeEnum(LearningGoalStatus);

export const learningGoalSchema = z.object({
	id: z.string().cuid(),
	description: z.string().min(5, "Description must be at least 5 characters long"),
	status: learningGoalStatusSchema.default(LearningGoalStatus.INACTIVE),
	children: z.array(z.string()).default([]),
	parentId: z.string().optional(),
	priority: z.number().int().default(0),
	order: z.number().int(),
	lastProgressUpdate: z.date().optional()
});

export const learningGoalEditSchema = learningGoalSchema.partial().extend({
	id: z.string(),
	description: learningGoalSchema.shape.description
});
export type LearningGoalEditInput = z.input<typeof learningGoalEditSchema>;

export const learningGoalCreateSchema = learningGoalSchema.omit({ id: true, order: true });

export const learningLocationSchema = z.object({
	name: z.string(),
	iconURL: z.string().optional().nullable(),
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

export type LearningDiaryPageInput = z.input<typeof learningDiaryPageSchema>; // use input type to allow default values
export type LearningDiaryPageOutput = z.output<typeof learningDiaryPageSchema>;

export type LearningGoal = z.infer<typeof learningGoalSchema>;

export const lessonStartSchema = z.object({
	entryId: z.string(),
	lessonId: z.string(),
	createdAt: z.date().optional()
});

export const learningStrategySchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string(),
	description: z.string()
});
