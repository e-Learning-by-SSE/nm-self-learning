import slugify from 'slugify';

import { faker } from '@faker-js/faker';
import { Prisma, PrismaClient } from '@prisma/client';
import { QuizContent } from '@self-learning/question-types';
import {
    createCourseContent,
    createCourseMeta,
    createLessonMeta,
    extractLessonIds,
    LessonContent,
} from '@self-learning/types';

import { courseFormSchema } from '../../../../feature/teaching/src/lib/course/course-form-model';

export function createLesson(
	title: string,
	subtitle: string | null,
	description: string,
	imgUrl: string,
	content: LessonContent[],
	questions: QuizContent
) {
	const lesson: Prisma.LessonCreateInput = {
		title,
		lessonId: faker.random.alphaNumeric(8),
		slug: slugify(title, { lower: true, strict: true }),
		subtitle: subtitle,
		description: description,
		imgUrl: imgUrl,
		content: content,
		quiz: questions,
		meta: {}
	};

	lesson.meta = createLessonMeta(lesson as any) as unknown as Prisma.JsonObject;

	return lesson;
}

type Lessons = {
	title: string;
	description: string;
	content: Prisma.LessonCreateInput[];
}[];

export function createAuthor(
	name: string,
	imgUrl: string,
	lessons: Lessons,
	courses: Prisma.CourseCreateManyInput[]
): Prisma.UserCreateInput {
	const slug = slugify(name, { lower: true, strict: true });
	return {
		name: name,
		accounts: {
			create: [
				{
					provider: "demo",
					providerAccountId: slug,
					type: "demo-account"
				}
			]
		},
		author: {
			create: {
				displayName: name,
				slug: slug,
				imgUrl: imgUrl,
				courses: {
					connect: courses.map(course => ({ courseId: course.courseId }))
				},
				lessons: {
					connect: extractLessonIds(lessons).map(lessonId => ({ lessonId }))
				},
				teams: {
					create: []
				}
			}
		}
	};
}
