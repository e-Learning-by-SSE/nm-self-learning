import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";

type UpsertLesson = {
	command: "upsertLesson";
	payload: Prisma.LessonCreateInput;
};

// Required to make the type union work (need two members)
type Placeholder = {
	command: "placeholder";
	payload: void;
};

export type TestingCommand = UpsertLesson | Placeholder;

export const testingActionHandler: {
	[Action in TestingCommand["command"]]: (
		payload: InferAction<Action>["payload"]
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
	placeholder: async () => {
		/**  */
	}
};

type InferAction<
	Command extends TestingCommand["command"],
	Union = TestingCommand
> = Union extends {
	command: Command;
}
	? Union
	: never;
