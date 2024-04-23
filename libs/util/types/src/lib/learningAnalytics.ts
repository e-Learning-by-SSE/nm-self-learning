export enum StorageKeys {
	LASession = "la_sessionInfo",
	LALesson = "la_lessonInfo",
	LAVideo = "la_videoInfo",
	LAQuiz = "la_quizInfo",
	LAMediaType = "la_mediaType"
}

export type LearningAnalyticsType = {
	start: Date;
	end: Date | null;
	learningAnalytics: SessionType[];
}[];

export type SessionInfoType = {
	start: Date;
	end: Date | null;
	id: number | null;
};

export type LessonInfoType = {
	start: Date | null;
	end: Date | null;
	lessonId: string | null;
	courseId: string | null;
};

export type VideoInfoType = {
	videoStart: Date | null;
	videoEnd: Date | null;
	videoBreaks: number | null;
	videoSpeed: number | null;
};

export type MediaTypeChangesInfoType = {
	video: number;
	article: number;
	iframe: number;
	pdf: number;
};

export type MediaTypeInfoType = {
	numberOfChangesMediaType: number | null;
	preferredMediaType: string | null;
};

export type QuizInfoType = {
	quizStart: Date | null;
	quizEnd: Date | null;
	numberCorrectAnswers: number | null;
	numberIncorrectAnswers: number | null;
	numberOfUsedHints: number | null;
};

export type SessionType = {
	start: Date | null;
	end: Date | null;
	sessionId: number;
	lessonId: string | null;
	quizStart: Date | null;
	quizEnd: Date | null;
	numberCorrectAnswers: number | null;
	numberIncorrectAnswers: number | null;
	numberOfUsedHints: number | null;
	numberOfChangesMediaType: number | null;
	preferredMediaType: string | null;
	videoStart: Date | null;
	videoEnd: Date | null;
	videoBreaks: number | null;
	videoSpeed: number | null;
};
