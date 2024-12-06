import { Author, Course, Lesson, Skill } from "@prisma/client";
import { CourseContent } from "@self-learning/types";

export function createLessonMock({
	lessonId,
	authors,
	slug,
	title,
	requirements,
	teachingGoals
}: {
	lessonId: string;
	authors: string[];
	slug?: string;
	title?: string;
	requirements?: Skill[];
	teachingGoals?: Skill[];
}): Partial<Lesson> &
	Pick<Lesson, "lessonId"> & { authors: Pick<Author, "username">[] } & {
		requirements: Skill[];
	} & { teachingGoals: Skill[] } {
	const defaultSkill: Skill = {
		id: "skill:1",
		name: "Skill1",
		description: "Skill1 description",
		repositoryId: "repo:1"
	};

	return {
		lessonId,
		slug: slug ?? lessonId,
		title: title ?? lessonId,
		subtitle: null,
		description: null,
		content: [
			{
				type: "article",
				value: { content: null }
			}
		],
		quiz: "Quiz",
		imgUrl: "imgUrl",
		licenseId: 1,
		requirements: requirements ?? [defaultSkill],
		teachingGoals: teachingGoals ?? [defaultSkill],
		authors: authors.map(author => ({ username: author })),
		selfRegulatedQuestion: null
	};
}

type ContentMockDefinition = {
	chapterTitle: string;
	lessons: string[];
}[];

export function createCourseMock({
	courseId,
	authors,
	content,
	slug,
	title,
	description
}: {
	courseId: string;
	authors: string[];
	content: ContentMockDefinition;
	slug?: string;
	title?: string;
	description?: string;
}): Partial<Course> & { authors: Pick<Author, "username">[] } & { content: CourseContent } {
	return {
		courseId,
		slug: slug ?? courseId,
		title: title ?? courseId,
		description: description ?? null,
		authors: authors.map(author => ({ username: author })),
		content: content.map(chapter => ({
			title: chapter.chapterTitle,
			content: chapter.lessons.map(lessonId => ({ lessonId }))
		}))
	};
}
