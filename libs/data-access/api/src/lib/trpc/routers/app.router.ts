import { database } from "@self-learning/database";
import { z } from "zod";
import { createRouter } from "../create-router";
import { courseRouter } from "./course.router";

const lessonRouter = createRouter()
	// Defines `lessons.findOne` endpoint that expects a `lessonId` as parameter and
	// returns the lessons with its title and authors.
	.query("findOne", {
		input: z.object({ lessonId: z.string() }),
		resolve({ input }) {
			return database.lesson.findUnique({
				where: {
					lessonId: input.lessonId
				},
				select: {
					title: true,
					authors: {
						select: {
							displayName: true
						}
					}
				}
			});
		}
	});

/** Merges all routers into a single object. */
export const appRouter = createRouter()
	.merge("courses.", courseRouter)
	.merge("lessons.", lessonRouter);

/** Contains type definitions of the api. */
export type AppRouter = typeof appRouter;
