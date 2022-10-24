export type TeachingChapter = {
	title: string;
	description?: string | null;
	content: TeachingLesson[];
};

export type TeachingLesson = {
	type: "lesson";
	title: string;
	lessonId: string;
	hasQuiz: boolean;
	requires?: Competence[];
	rewards?: Competence[];
};

export type Competence = { title: string; level: number; context?: string };

export type TeachingContent = TeachingChapter[];

export type Summary = {
	count: {
		lessons: number;
		chapters: number;
		quizzes: number;
	};
	competences: Map<string, Competence>;
};
