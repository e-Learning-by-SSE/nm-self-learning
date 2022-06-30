import type { EnrollmentStatus } from "@prisma/client";

export type CourseContent = CourseChapter[];

export type CourseChapter = {
	title: string;
	description: string | null;
	lessonIds: string[];
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

export type CourseEnrollment = {
	completedAt: Date | null;
	status: EnrollmentStatus;
	course: {
		title: string;
		slug: string;
	};
};
