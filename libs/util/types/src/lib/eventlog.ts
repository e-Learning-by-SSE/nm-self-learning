import { z } from "zod";

export const ActionPayloadTypesSchema = z.object({
	USER_LOGIN: z.undefined(),
	USER_LOGOUT: z.undefined(),
	COURSE_START: z.undefined(),
	COURSE_STOP: z.undefined(),
	COURSE_COMPLETE: z.undefined(),
	COURSE_RESUME: z.object({
		resumeLessonId: z.string()
	}),
	LESSON_START: z.undefined(),
	LESSON_STOP: z.undefined(),
	LESSON_RESUME: z.undefined(),
	LESSON_RESTART: z.undefined(),
	LESSON_COMPLETE: z.undefined(),
	LESSON_ASSESSMENT_SUBMISSION: z.object({
		index: z.number(),
		type: z.string(),
		hints: z.number(),
		attempts: z.number(),
		solved: z.boolean(),
		timeSpentSeconds: z.number()
	}),
	LESSON_ASSESSMENT_START: z.undefined(),
	VIDEO_PLAY: z.object({
		videoCurrentTime: z.number()
	}),
	VIDEO_PAUSE: z.object({
		videoCurrentTime: z.number()
	}),
	VIDEO_END: z.undefined(),
	VIDEO_JUMP: z.object({
		videoJump: z.number(),
		videoLand: z.number()
	}),
	VIDEO_OPENED: z.object({ url: z.string() }),
	VIDEO_SPEED: z.object({ videoSpeed: z.number() }),
	VIDEO_RESOLUTION: z.object({ resolution: z.string() }), // TODO
	VIDEO_START: z.undefined(),
	VIDEO_STOP: z.undefined(),
	// VIDEO_REPLAY: z.undefined(),
	ERROR: z.object({
		error: z.string(),
		path: z.string()
	})
});

export type ActionPayloadTypes = z.infer<typeof ActionPayloadTypesSchema>;
export type Actions = keyof ActionPayloadTypes;

export const userEventSchema = z.object({
	// id: z.number(),
	// userId: z.string(),
	action: z.enum(Object.keys(ActionPayloadTypesSchema.shape) as [Actions, ...Actions[]]),
	resourceId: z.string().optional(),
	payload: z.union([z.never(), z.never(), ...Object.values(ActionPayloadTypesSchema.shape)])
});

export const eventWhereSchema = z.object({
	start: z.date().optional(),
	end: z.date().optional(),
	action: z
		.array(z.enum(Object.keys(ActionPayloadTypesSchema.shape) as [Actions, ...Actions[]]))
		.optional(),
	resourceId: z.string().optional()
});

export type EventWhereClause = z.input<typeof eventWhereSchema>;

const eventLogQuerySchema = eventWhereSchema.extend({
	userId: z.string()
});

export type EventLogQueryInput = z.input<typeof eventLogQuerySchema>;
