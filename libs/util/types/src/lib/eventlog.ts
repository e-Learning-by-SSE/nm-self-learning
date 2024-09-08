import { z } from "zod";

export const actionPayloadTypesSchema = z.object({
	USER_LOGIN: z.undefined(),
	USER_LOGOUT: z.undefined(),
	COURSE_ENROLL: z.undefined(),
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
	LESSON_QUIZ_SUBMISSION: z.object({
		index: z.number(),
		type: z.string(),
		hints: z.number(),
		attempts: z.number(),
		solved: z.boolean()
		// timeSpentSeconds: z.number()
	}),
	LESSON_QUIZ_START: z.object({
		index: z.number(),
		type: z.string()
	}),
	LESSON_VIDEO_PLAY: z.object({
		videoCurrentTime: z.number()
	}),
	LESSON_VIDEO_PAUSE: z.object({
		videoCurrentTime: z.number()
	}),
	LESSON_VIDEO_END: z.undefined(),
	LESSON_VIDEO_JUMP: z.object({
		videoJump: z.number(),
		videoLand: z.number()
	}),
	LESSON_VIDEO_OPENED: z.object({ url: z.string() }),
	LESSON_VIDEO_SPEED: z.object({ videoSpeed: z.number() }),
	LESSON_VIDEO_RESOLUTION: z.object({ resolution: z.string() }), // TODO
	LESSON_VIDEO_START: z.undefined(),
	LESSON_VIDEO_STOP: z.undefined(),
	// VIDEO_REPLAY: z.undefined(),
	ERROR: z.object({
		error: z.string(),
		path: z.string()
	})
});

export type ActionPayloadTypes = z.infer<typeof actionPayloadTypesSchema>;
export type Actions = keyof ActionPayloadTypes;

export const userEventSchema = z.object({
	// id: z.number(),
	// username: z.string(),
	action: z.enum(Object.keys(actionPayloadTypesSchema.shape) as [Actions, ...Actions[]]),
	resourceId: z.string().optional(),
	payload: z.union([z.never(), z.never(), ...Object.values(actionPayloadTypesSchema.shape)])
});

export const eventWhereSchema = z.object({
	start: z.date().optional(),
	end: z.date().optional(),
	action: z
		.array(z.enum(Object.keys(actionPayloadTypesSchema.shape) as [Actions, ...Actions[]]))
		.optional(),
	resourceId: z.string().optional()
});

export type EventWhereClause = z.input<typeof eventWhereSchema>;

const eventLogQuerySchema = eventWhereSchema.extend({
	username: z.string()
});

export type EventLogQueryInput = z.input<typeof eventLogQuerySchema>;
