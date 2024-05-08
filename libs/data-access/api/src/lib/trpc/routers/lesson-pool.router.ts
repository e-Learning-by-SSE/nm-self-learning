import { lessonPollCreationSchema } from "./../../../../../../util/types/src/lib/lesson-pool";
import { authorProcedure, t } from "../trpc";
import * as z from "zod";
import { database } from "@self-learning/database";

export const lessonPoolRouter = t.router({
	getLessonPoolById: authorProcedure // TODO remove
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			try {
				const lessonPools = await database.lessonPool.findUnique({
					where: { id: input.id },
					select: { lessons: true }
				});
				return lessonPools;
			} catch (error) {
				console.log("Error while loading lesson pool", error);
			}
		}),
	findOne: authorProcedure.input(z.object({ id: z.string() })).query(({ input }) => {
		return database.lessonPool.findUniqueOrThrow({
			where: { id: input.id },
			select: { lessons: true }
		});
	}),
	add: authorProcedure
		.input(z.object({ lessonPool: lessonPollCreationSchema }))
		.mutation(async ({ input }) => {
			return await database.lessonPool.create({
				data: { ...input.lessonPool }
			});
		}),
	updateLessons: authorProcedure
		.input(
			z.object({
				id: z.string(),
				lessons: z.array(z.string())
			})
		)
		.mutation(async ({ input }) => {
			return await database.lessonPool.update({
				where: { id: input.id },
				data: { lessons: { set: input.lessons } }
			});
		})
});
