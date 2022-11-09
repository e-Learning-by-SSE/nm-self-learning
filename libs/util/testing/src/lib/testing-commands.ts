import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";

export const testingActionHandler = {
	upsertLesson: async (payload: Prisma.LessonCreateInput) => {
		const lesson = await database.lesson.upsert({
			where: { lessonId: payload.lessonId },
			create: payload,
			update: payload
		});

		return lesson;
	},
	upsertCourse: async (payload: {
		create: Prisma.CourseCreateInput;
		update: Prisma.CourseUpdateInput;
		lessons?: Prisma.LessonCreateManyArgs;
	}) => {
		const course = await database.course.upsert({
			where: { courseId: payload.create.courseId },
			create: payload.create,
			update: payload.update
		});

		if (payload.lessons) {
			await database.lesson.createMany(payload.lessons);
		}

		return course;
	}
};

type Handler = typeof testingActionHandler;

export type TestingCommand = {
	[C in keyof Handler]: Parameters<Handler[C]>[0];
};
