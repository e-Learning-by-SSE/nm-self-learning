import { z } from "zod";

// Single source of truth
const eventDefinitions = {
	USER_MODIFY: z.object({
		type: z.any(), // TODO
		value: z.any()
	}),
	USER_LOGIN: z.undefined(),
	USER_LOGOUT: z.undefined(),
	COURSE_ENROLL: z.undefined(),
	COURSE_START: z.undefined(),
	COURSE_STOP: z.undefined(),
	COURSE_COMPLETE: z.undefined(),
	COURSE_RESUME: z.object({
		resumeLessonId: z.string()
	}),
	/**
	 * Fired when a lesson learning session starts/is re intialised.
	 */
	LESSON_LEARNING_START: z.object({
		lessonAttemptId: z.string()
	}),
	/**
	 * Fired when a a lesson is opened, either from the course overview or from a lesson attempt.
	 * This is fired each time a user reloads the page.
	 * Could be replace by LESSON_LEARNING_START, in the future.
	 */
	LESSON_OPEN: z.object({
		lessonAttemptId: z.string()
	}),
	/**
	 * Fired when the user leaves the lesson page. Does not include the quiz page
	 */
	LESSON_EXIT: z.object({
		lessonAttemptId: z.string()
	}),
	LESSON_RESUME: z.undefined(),
	LESSON_RESTART: z.undefined(),
	/**
	 * Fired when a lesson is over. Either at the end of a quiz or, if no quiz is
	 * present, when the lesson is completed. Guaranteed to be fired after LESSON_QUIZ_SUBMISSION
	 */
	LESSON_LEARNING_SUBMIT: z.object({
		lessonAttemptId: z.string(),
		completionState: z.enum(["completed", "failed"]),
		pauseCount: z.number().int().nonnegative(),
		effectiveTimeLearned: z.number(), // screen-focus: time spent minus pauses // seconds
		performanceScore: z.number().min(0).max(1)
	}),
	/**
	 * Fired when a lesson is marked as completed.
	 *
	 * @deprecated since 2025-05-25, use LESSON_LEARNING_SUBMIT instead.
	 * Event aren't fired anymore, but the schema is kept for backwards compatibility because old events might still exist and can't be converted into the new schema
	 * because information is missing.
	 */
	LESSON_COMPLETE: z.object({
		completedLessonId: z.string()
	}),
	LESSON_QUIZ_SUBMISSION: z.object({
		lessonAttemptId: z.string(),
		questionId: z.string(),
		totalQuestionPool: z.number(),
		questionPoolIndex: z.number(),
		type: z.string(),
		hintsUsed: z.array(z.string()),
		attempts: z.number(),
		solved: z.boolean()
	}),
	LESSON_QUIZ_START: z.object({
		lessonAttemptId: z.string(),
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
	LESSON_VIDEO_RESOLUTION: z.object({ resolution: z.string() }),
	LESSON_VIDEO_START: z.undefined(),
	LESSON_VIDEO_STOP: z.undefined(),
	LTB_TOGGLE: z.object({ enabled: z.boolean() }),
	ACHIEVEMENT_REDEEMED: z.undefined(),
	EMAIL_REFERRAL: z.undefined(),
	PAGE_VIEW: z.object({
		userAgent: z.string()
	}),
	ENERGY_USED: z.object({
		energyUsed: z.number().int().nonnegative(),
		newValue: z.number().int().nonnegative(),
		usedFor: z.enum(["refire", "pause"])
	}),
	ERROR: z.object({
		error: z.string(),
		path: z.string()
	})
} as const;

export type EventTypeKeys = keyof typeof eventDefinitions;
export type EventTypeMap = {
	[K in EventTypeKeys]: z.infer<(typeof eventDefinitions)[K]>;
};
export type EventPayload<T extends EventTypeKeys> = EventTypeMap[T];

export const eventSchema = z.discriminatedUnion(
	"type",
	Object.entries(eventDefinitions).map(([type, payloadSchema]) =>
		z.object({
			type: z.literal(type as EventTypeKeys),
			payload: payloadSchema
		})
	) as [
		z.ZodObject<{ type: z.ZodLiteral<EventTypeKeys>; payload: any }>,
		...z.ZodObject<{ type: z.ZodLiteral<EventTypeKeys>; payload: any }>[]
	]
);

export type EventLog<T extends EventTypeKeys = EventTypeKeys> = {
	type: T;
	payload: EventPayload<T>;
	resourceId?: string;
	courseId?: string;
};

// Full event schema with metadata
export const eventLogSchema = z
	.object({
		type: z.string(),
		payload: z.unknown(),
		resourceId: z.string().optional(),
		courseId: z.string().optional()
	})
	.superRefine((data, ctx) => {
		const eventResult = eventSchema.safeParse({
			type: data.type,
			payload: data.payload
		});

		if (!eventResult.success) {
			eventResult.error.issues.forEach(issue => {
				ctx.addIssue({
					...issue,
					path: [...ctx.path, ...issue.path]
				});
			});
		}
	})
	.transform(data => {
		const event = eventSchema.parse({
			type: data.type,
			payload: data.payload
		});
		return {
			...event,
			resourceId: data.resourceId,
			courseId: data.courseId
		} as EventLog<typeof event.type>;
	});

// Query schemas
export const eventWhereSchema = z.object({
	start: z.date().optional(),
	end: z.date().optional(),
	type: z.array(z.string()).or(z.string()).optional(),
	resourceId: z.array(z.string()).or(z.string()).optional(),
	courseId: z.array(z.string()).or(z.string()).optional()
});

export type EventWhereClause = z.input<typeof eventWhereSchema>;

const eventLogQuerySchema = eventWhereSchema.extend({
	username: z.string()
});

export type EventLogQueryInput = z.input<typeof eventLogQuerySchema>;

export function getPayloadSchema<T extends EventTypeKeys>(type: T): (typeof eventDefinitions)[T] {
	return eventDefinitions[type];
}

// Type guard for runtime type checking
export function isEventOfType<T extends EventTypeKeys>(
	event: EventLog,
	type: T
): event is EventLog<T> {
	return event.type === type;
}

// Utility to validate a specific event type at runtime
export function validateEvent<T extends EventTypeKeys>(type: T, payload: unknown): EventPayload<T> {
	const schema = getPayloadSchema(type);

	if (schema === z.undefined()) {
		if (payload !== undefined) {
			throw new Error(`Event type "${type}" does not expect a payload, but received one.`);
		}
		return undefined as EventPayload<T>;
	}

	try {
		const parsed = schema.parse(payload);
		if (parsed === undefined) {
			throw new Error(`Event type "${type}" expects a payload but received undefined.`);
		}
		return parsed as EventPayload<T>;
	} catch (err) {
		throw new Error(`Invalid payload for event type "${type}": ${(err as Error).message}`);
	}
}
