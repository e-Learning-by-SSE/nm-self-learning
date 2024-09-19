import { z } from "zod";

export const evenTypePayloadSchema = z.object({
	USER_LOGIN: z.undefined(),
	USER_LOGOUT: z.undefined(),
	COURSE_ENROLL: z.undefined(),
	COURSE_START: z.undefined(),
	COURSE_STOP: z.undefined(),
	COURSE_COMPLETE: z.undefined(),
	COURSE_RESUME: z.object({
		resumeLessonId: z.string()
	}),
	LESSON_OPEN: z.undefined(),
	LESSON_STOP: z.undefined(),
	LESSON_RESUME: z.undefined(),
	LESSON_RESTART: z.undefined(),
	LESSON_COMPLETE: z.undefined(),
	LESSON_QUIZ_SUBMISSION: z.object({
		index: z.string(),
		type: z.string(),
		hintsUsed: z.array(z.string()),
		attempts: z.number(),
		solved: z.boolean()
		// timeSpentSeconds: z.number()
	}),
	LESSON_QUIZ_START: z.object({
		index: z.number(),
		type: z.string()
	}),
	LESSON_VIDEO_PLAY: z.object({
		url: z.string(),
		videoCurrentTime: z.number()
	}),
	LESSON_VIDEO_PAUSE: z.object({
		url: z.string(),
		videoCurrentTime: z.number()
	}),
	LESSON_VIDEO_END: z.object({
		url: z.string()
	}),
	LESSON_VIDEO_JUMP: z.object({
		videoJump: z.number(),
		videoLand: z.number()
	}),
	LESSON_VIDEO_OPENED: z.object({ url: z.string() }),
	LESSON_VIDEO_SPEED: z.object({ videoSpeed: z.number() }),
	LESSON_VIDEO_RESOLUTION: z.object({ resolution: z.string() }), // TODO
	LESSON_VIDEO_START: z.undefined(),
	LESSON_VIDEO_STOP: z.undefined(),
	ERROR: z.object({
		error: z.string(),
		path: z.string()
	})
});

export type EventType = z.infer<typeof evenTypePayloadSchema>;
export type EventTypeKeys = keyof EventType;

const typeSchema = z.enum(
	Object.keys(evenTypePayloadSchema.shape) as [EventTypeKeys, ...EventTypeKeys[]]
);
export const eventLogSchema = z.object({
	type: typeSchema,
	resourceId: z.string().optional(),
	courseId: z.string().optional(),
	payload: z.union([z.never(), z.never(), ...Object.values(evenTypePayloadSchema.shape)])
});

// don't use inferred type from eventLogSchema here, as it will be a union of all possible types
export type EventLog<K extends EventTypeKeys> = {
	type: K;
	payload: EventType[K];
	resourceId?: string;
	courseId?: string;
};

export const eventWhereSchema = z.object({
	start: z.date().optional(),
	end: z.date().optional(),
	type: z.union([typeSchema, z.array(typeSchema)]).optional(),
	resourceId: z.union([z.string(), z.array(z.string())]).optional(),
	courseId: z.union([z.string(), z.array(z.string())]).optional()
});

export type EventWhereClause = z.input<typeof eventWhereSchema>;

const eventLogQuerySchema = eventWhereSchema.extend({
	username: z.string()
});

export type EventLogQueryInput = z.input<typeof eventLogQuerySchema>;
