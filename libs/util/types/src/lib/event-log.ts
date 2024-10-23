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
		questionId: z.string(),
		totalQuestionPool: z.number(),
		questionPoolIndex: z.number(),
		type: z.string(),
		hintsUsed: z.array(z.string()),
		attempts: z.number(),
		solved: z.boolean()
		// timeSpentSeconds: z.number()
	}),
	LESSON_QUIZ_START: z.object({
		questionId: z.string(),
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
	}),
	LTB_TOGGLE: z.object({ enabled: z.boolean() })
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
	type: z.array(typeSchema).or(typeSchema).optional(),
	resourceId: z.array(z.string()).or(z.string()).optional(),
	courseId: z.array(z.string()).or(z.string()).optional()
});
// .refine(
// 	data => {
// 		// specify conditions to limit the data a user can query.

// 		// // Bedingung 1: Prüfen, ob sowohl start als auch end gesetzt sind und max. 6 Monate auseinanderliegen
// 		// if (data.start) {
// 		// 	const monthsDifference = differenceInMonths(data.end ?? new Date(), data.start);
// 		// 	if (monthsDifference > 6) {
// 		// 		return false;
// 		// 	}
// 		// } else {
// 		// 	else if (!data.resourceId && !data.courseId) {
// 		// 		// resourceId und courseId sind beide nicht gesetzt, also ungültig
// 		// 		return false;
// 		// 	} // Bedingung 3: Wenn kein Typ gesetzt ist, müssen entweder resourceId oder courseId vorhanden sein
// 		// 	else if (!data.type && (!data.resourceId || !data.courseId)) {
// 		// 		return false;
// 		// 	}
// 		// }

// 		return true;
// 	},
// 	{
// 		message:
// 			"Entweder müssen (start und end, max 6 Monate auseinander), oder (resourceId oder courseId), oder (type) gesetzt sein."
// 	}
// );

export type EventWhereClause = z.input<typeof eventWhereSchema>;

const eventLogQuerySchema = eventWhereSchema.extend({
	username: z.string()
});

export type EventLogQueryInput = z.input<typeof eventLogQuerySchema>;
