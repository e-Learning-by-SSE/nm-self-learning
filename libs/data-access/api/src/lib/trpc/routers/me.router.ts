import { database } from "@self-learning/database";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import { findLessons } from "./lesson.router";
import { randomUUID } from "crypto";

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
	delete: authProcedure.mutation(async ({ ctx }) => {
		const result = await database.$transaction(async prisma => {
			const user = await prisma.user.findUnique({
				where: { name: ctx.user.name }
			});

			if (!user) {
				return false;
			}

			const lessons = await findLessons({ authorName: ctx.user.name });
			const lessonsIds = lessons.lessons.map(lesson => lesson.lessonId);

			const courses = await prisma.course.findMany({
				where: {
					authors: {
						some: {
							username: ctx.user.name
						}
					}
				}
			});
			const courseIds = courses.map(course => course.courseId);

			const skills = await prisma.skillRepository.findMany({
				where: {
					ownerName: ctx.user.name
				}
			});
			const skillsIds = skills.map(skill => skill.id);

			const username = "anonymous" + randomUUID();

			await prisma.user.create({
				data: {
					name: username,
					displayName: user.displayName,
					role: user.role,
					author: {
						create: {
							displayName: user.displayName,
							slug: username,
							lessons: {
								connect: lessonsIds.map(lessonId => ({ lessonId }))
							},
							courses: {
								connect: courseIds.map(courseId => ({ courseId }))
							}
						}
					},
					skillRepositories: {
						connect: skillsIds.map(id => ({ id }))
					}
				}
			});

			await prisma.user.delete({
				where: { name: ctx.user.name }
			});

			return true;
		});

		return result;
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
