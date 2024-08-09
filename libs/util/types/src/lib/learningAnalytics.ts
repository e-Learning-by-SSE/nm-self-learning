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
	["la_period"]: LearningSequence;
	["la_activity"]: LearningActivity;
	// ["la_lessonInfo"]: LessonInfoType;
	// ["la_videoInfo"]: VideoInfoType;
	// ["la_quizInfo"]: QuizInfoType;
	// ["la_mediaType"]: MediaTypeChangesInfoType;
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

const learningSequenceSchema = z.object({
	start: z.date(),
	id: z.string().uuid().optional(),
	end: z.date().optional()
});
export type LearningSequence = z.infer<typeof learningSequenceSchema>;

// const learningAnalyticsSchema = z.array(
// 	z.object({
// 		start: z.date(),
// 		end: z.date().nullable(),
// 		learningAnalytics: z.array(learningSequenceSchema)
// 	})
// );
// export type LearningAnalyticsType = z.infer<typeof learningAnalyticsSchema>;

export const analyticsSchema = z.object({
	lessonId: z.string().uuid(),
	courseId: z.string().nullable(),
	lessonStart: z.date(),
	lessonEnd: z.date().nullable(),
	videoStart: z.date(),
	videoEnd: z.date().nullable(),
	videoBreaks: z.number().nullable(),
	videoSpeed: z.number().nullable(),
	preferredMediaType: z.string().nullable(), // preferred? active choice? last choice? define raw data
	quizStart: z.date(),
	quizEnd: z.date().nullable(),
	numberCorrectAnswers: z.number(),
	numberIncorrectAnswers: z.number(),
	numberOfUsedHints: z.number(),
	// mediaChangeCountVideo: z.number(),
	// mediaChangeCountArticle: z.number(),
	// mediaChangeCountIframe: z.number(),
	// mediaChangeCountPdf: z.number()
	mediaChangeCount: z.object({
		video: z.number(),
		article: z.number(),
		iframe: z.number(),
		pdf: z.number()
	})
	// quiz: z.object({
	// 	start: z.date(),
	// 	end: z.date().nullable(),
	// 	correctAnswerCount: z.number(),
	// 	incorrectAnswerCount: z.number(),
	// 	usedHintCount: z.number()
	// }),
	// lesson: z.object({
	// 	id: z.string().uuid(),
	// 	title: z.string(),
	// 	slug: z.string(),
	// 	start: z.date(),
	// 	end: z.date().nullable()
	// }),
	// video: z.object({
	// 	start: z.date(),
	// 	end: z.date().nullable(),
	// 	break: z.number().nullable(),
	// 	speed: z.number().nullable()
	// })
});

export type LearningActivity = z.infer<typeof analyticsSchema>;
