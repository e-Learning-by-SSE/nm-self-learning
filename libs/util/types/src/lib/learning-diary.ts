import { LearningGoalStatus } from "@prisma/client";
import { z } from "zod";

export const techniqueRatingSchema = z.object({
	id: z.string().uuid(),
	score: z.number().int()
});

const learningGoalStatusSchema = z.nativeEnum(LearningGoalStatus);

const learningSubGoalSchema = z.object({
	id: z.string().cuid(),
	description: z.string().min(1),
	status: learningGoalStatusSchema.default(LearningGoalStatus.INACTIVE).optional(),
	priority: z.number().int(),
	learningGoalId: z.string().cuid()
});

const learningGoalSchema = z.object({
	id: z.string().cuid(),
	description: z.string().min(1),
	status: learningGoalStatusSchema.default(LearningGoalStatus.INACTIVE),
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

export type LearningDiaryPage = z.input<typeof learningDiaryPageSchema>; // use input type to allow default values

export const lessonStartSchema = z.object({
	entryId: z.string(),
	lessonId: z.string(),
	createdAt: z.date().optional()
});
