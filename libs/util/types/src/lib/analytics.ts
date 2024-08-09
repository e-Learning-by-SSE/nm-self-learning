import { z } from "zod";

// export const analyticsSchema = z.object({
// 	lessonId: z.string(),
// 	courseId: z.string(),
// 	sessionId: z.number(),
// 	start: z.string().datetime().nullable(),
// 	end: z.string().datetime().nullable(),
// 	quizStart: z.string().datetime().nullable(),
// 	quizEnd: z.string().datetime().nullable(),
// 	numberCorrectAnswers: z.number().nullable(),
// 	numberIncorrectAnswers: z.number().nullable(),
// 	numberOfUsedHints: z.number().nullable(),
// 	numberOfChangesMediaType: z.number().nullable(),
// 	preferredMediaType: z.string().nullable(),
// 	videoBreaks: z.number().nullable(),
// 	videoStart: z.string().datetime().nullable(),
// 	videoEnd: z.string().datetime().nullable(),
// 	videoSpeed: z.number().nullable()
// 	//videoCalculatedSpeed: z.number()
// });

// export const analyticsSchema = z.object({
// 	id: z.number(),

// 	sessionId: z.number(),
// 	courseId: z.string(),

// 	end: z.string().datetime(),
// 	quizStart: z.string().datetime(),
// 	quizEnd: z.string().datetime(),
// 	numberCorrectAnswers: z.number(),
// 	numberIncorrectAnswers: z.number(),
// 	numberOfUsedHints: z.number(),
// 	numberOfChangesMediaType: z.number(),
// 	preferredMediaType: z.string(),
// 	videoBreaks: z.number(),
// 	videoStart: z.string().datetime(),
// 	videoEnd: z.string().datetime(),
// 	videoSpeed: z.number(),
// 	videoCalculatedSpeed: z.number().nullable()
// });

// export type Analytics = z.infer<typeof analyticsSchema>;
