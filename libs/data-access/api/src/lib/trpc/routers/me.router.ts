import { database } from "@self-learning/database";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import { findLessons } from "./lesson.router";

export const meRouter = t.router({
	permissions: authProcedure.query(({ ctx }) => {
		return database.user.findUnique({
			where: { name: ctx.user.name },
			select: {
				role: true,
				author: {
					select: {
						subjectAdmin: {
							select: {
								subjectId: true
							}
						},
						specializationAdmin: {
							select: {
								specializationId: true
							}
						}
					}
				}
			}
		});
	}),
	deleteMe: authProcedure.mutation(async ({ ctx }) => {
		await database.user.delete({
			where: { name: ctx.user.name }
		});
		return true;
	}),
	deleteMeAndAllData: authProcedure.mutation(async ({ ctx }) => {
		await database.user.delete({
			where: { name: ctx.user.name }
		});

		await database.lesson.deleteMany({
			where: { authors: { some: { username: ctx.user.name } } }
		});
		await database.course.deleteMany({
			where: { authors: { some: { username: ctx.user.name } } }
		});
		return true;
	}),
	getAllCreatedCourseAndLessons: authProcedure.query(async ({ ctx }) => {
		const courses = await database.course.findMany({
			where: {
				authors: {
					some: {
						username: ctx.user.name
					}
				}
			}
		});

		const lessons = await findLessons({
			authorName: ctx.user.name
		});

		return { courses, lessons };
	}),
	updateStudent: authProcedure
		.input(
			z.object({
				user: z.object({
					displayName: z.string().min(3).max(50)
				})
			})
		)
		.mutation(async ({ ctx, input }) => {
			const updated = await database.user.update({
				where: { name: ctx.user.name },
				data: {
					displayName: input.user.displayName
				},
				select: {
					name: true,
					displayName: true
				}
			});

			console.log("[meRouter.updateStudent] Student updated", updated);
			return updated;
		})
});
