export type CourseContent = CourseChapter[];

export type CourseChapter = {
	title: string;
	description?: string | null;
	lessons: { lessonId: string }[];
};

export type CourseCompletion = {
	courseCompletionPercentage: number;
	chapters: {
		title: string;
		completedLessonsCount: number;
		completedLessonsPercentage: number;
	}[];
	completedLessons: {
		[lessonId: string]: {
			createdAt: Date;
			title: string;
			slug: string;
		};
	};
};
