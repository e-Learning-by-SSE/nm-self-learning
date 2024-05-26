import { z } from "zod";

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

// export type SessionType = {
// 	start: Date | null;
// 	end: Date | null;
// 	sessionId: number;
// 	lessonId: string | null;
// 	quizStart: Date | null;
// 	quizEnd: Date | null;
// 	numberCorrectAnswers: number | null;
// 	numberIncorrectAnswers: number | null;
// 	numberOfUsedHints: number | null;
// 	numberOfChangesMediaType: number | null;
// 	preferredMediaType: string | null;
// 	videoStart: Date | null;
// 	videoEnd: Date | null;
// 	videoBreaks: number | null;
// 	videoSpeed: number | null;
// };

// export type Analytics = z.infer<typeof analyticsSchema>;

export interface StorageTypeMap {
	["la_period"]: LearningPeriodType;
	["la_lessonInfo"]: LessonInfoType;
	["la_videoInfo"]: VideoInfoType;
	["la_quizInfo"]: QuizInfoType;
	["la_mediaType"]: MediaTypeChangesInfoType;
}

export type StorageKeys = keyof StorageTypeMap;

// export type LearningAnalyticsType = {
// 	start: Date;
// 	end: Date | null;
// 	learningAnalytics: SessionType[];
// }[];

// export type SessionInfoType = {
// 	start: Date;
// 	end: Date | null;
// 	id: number | null;
// };

// export type LessonInfoType = {
// 	start: Date | null;
// 	end: Date | null;
// 	lessonId: string | null;
// 	courseId: string | null;
// };

// export type VideoInfoType = {
// 	videoStart: Date | null;
// 	videoEnd: Date | null;
// 	videoBreaks: number | null;
// 	videoSpeed: number | null;
// };

// export type MediaTypeChangesInfoType = {
// 	video: number;
// 	article: number;
// 	iframe: number;
// 	pdf: number;
// };

// export type MediaTypeInfoType = {
// 	numberOfChangesMediaType: number | null;
// 	preferredMediaType: string | null;
// };

// export type QuizInfoType = {
// 	quizStart: Date | null;
// 	quizEnd: Date | null;
// 	numberCorrectAnswers: number | null;
// 	numberIncorrectAnswers: number | null;
// 	numberOfUsedHints: number | null;
// };

const learningPeriodSchema = z.object({
	start: z.date(),
	id: z.string().uuid().optional(),
	end: z.date().optional()
});
export type LearningPeriodType = z.infer<typeof learningPeriodSchema>;

const lessonInfoSchema = z.object({
	lessonId: z.string().uuid(),
	courseId: z.string().nullable(),
	lessonStart: z.date(),
	lessonEnd: z.date().nullable()
});
export type LessonInfoType = z.infer<typeof lessonInfoSchema>;

const videoInfoSchema = z.object({
	videoStart: z.date(),
	videoEnd: z.date().nullable(),
	videoBreaks: z.number().nullable(),
	videoSpeed: z.number().nullable()
});
export type VideoInfoType = z.infer<typeof videoInfoSchema>;

const mediaTypeChangesInfoSchema = z.object({
	video: z.number(),
	article: z.number(),
	iframe: z.number(),
	pdf: z.number()
});
export type MediaTypeChangesInfoType = z.infer<typeof mediaTypeChangesInfoSchema>;

const mediaTypeInfoSchema = z.object({
	numberOfChangesMediaType: z.number().nullable(),
	preferredMediaType: z.string().nullable()
});
export type MediaTypeInfoType = z.infer<typeof mediaTypeInfoSchema>;

const quizInfoSchema = z.object({
	quizStart: z.date(),
	quizEnd: z.date().nullable(),
	numberCorrectAnswers: z.number(),
	numberIncorrectAnswers: z.number(),
	numberOfUsedHints: z.number()
});
export type QuizInfoType = z.infer<typeof quizInfoSchema>;

const learningAnalyticsSchema = z.array(
	z.object({
		start: z.date(),
		end: z.date().nullable(),
		learningAnalytics: z.array(learningPeriodSchema)
	})
);
export type LearningAnalyticsType = z.infer<typeof learningAnalyticsSchema>;

export const analyticsSchema = z.object({
	...lessonInfoSchema.shape,
	...videoInfoSchema.shape,
	...mediaTypeChangesInfoSchema.shape,
	...mediaTypeInfoSchema.shape,
	...quizInfoSchema.shape
});

export type FullAnalyticsType = z.infer<typeof analyticsSchema>;
