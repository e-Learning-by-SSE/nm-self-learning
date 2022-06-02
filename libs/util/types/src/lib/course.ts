export type CourseChapter = {
	title: string;
	description?: string | null;
	lessons: { lessonId: string }[];
};

export type CourseCompletion = {
	createdAt: Date;
	lessonId: string;
	title: string;
	slug: string;
};
