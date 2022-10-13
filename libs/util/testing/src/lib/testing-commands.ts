import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";

export type TestingCommand =
	| {
			command: "upsertLesson";
			payload: Prisma.LessonCreateInput;
	  }
	| {
			command: "upsertCourse";
			payload: {
				create: Prisma.CourseCreateInput;
				update: Prisma.CourseUpdateInput;
			};
	  };

export const testingActionHandler: {
	[Action in TestingCommand["command"]]: (
		payload: InferCommand<Action>["payload"]
	) => Promise<unknown>;
} = {
	upsertLesson: async payload => {
		const lesson = await database.lesson.upsert({
			where: { lessonId: payload.lessonId },
			create: payload,
			update: payload
		});

		return lesson;
	},
	upsertCourse: async payload => {
		const course = await database.course.upsert({
			where: { courseId: payload.create.courseId },
			create: payload.create,
			update: payload.update
		});

		return course;
	}
};

type InferCommand<
	Command extends TestingCommand["command"],
	Union = TestingCommand
> = Union extends {
	command: Command;
}
	? Union
	: never;
