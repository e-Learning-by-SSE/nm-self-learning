import { database } from "@self-learning/database";
import { authProcedure, t } from "../trpc";
import { editUserSettingsSchema } from "@self-learning/types";
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
		return await database.$transaction(async tx => {
			const user = await tx.user.findUnique({
				where: { name: ctx.user.name },
				include: {
					author: true
				}
			});

			if (!user) {
				return false;
			}
			/*
<<<<<<< HEAD
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

			const authorId = await prisma.author.findUnique({
				where: { username: ctx.user.name },
				select: { id: true }
			});

			const skills = await prisma.skill.findMany({
				where: {
					authorId: authorId ? authorId.id : undefined,
				}
			});

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
=======
*/
			const anonymousUsername = "anonymous-" + randomUUID();

			await tx.user.create({
				data: {
					name: anonymousUsername,
					displayName: "Deleted User",
					role: "USER"
				}
			});

			if (user.author) {
				await tx.author.update({
					where: {
						username: user.name
					},
					data: {
						username: anonymousUsername,
						slug: anonymousUsername
					}
				});
			}

			await tx.eventLog.updateMany({
				where: {
					username: user.name
				},
				data: {
					username: anonymousUsername
				}
			});

			await tx.user.delete({
				where: { name: ctx.user.name }
			});

			return true;
		});
	}),
	updateSettings: authProcedure.input(editUserSettingsSchema).mutation(async ({ ctx, input }) => {
		await database.$transaction(async tx => {
			const dbSettings = await tx.user.findUnique({
				where: {
					name: ctx.user.name
				}
			});

			const { user } = input;
			const isUserDefined = user !== undefined;
			const isFeatureLearningDiaryChanged =
				dbSettings?.enabledFeatureLearningDiary !== user?.enabledFeatureLearningDiary;
			const shouldLogEvent = isUserDefined && isFeatureLearningDiaryChanged;
			if (shouldLogEvent) {
				await tx.eventLog.create({
					data: {
						type: "LTB_TOGGLE",
						payload: { enabled: user.enabledFeatureLearningDiary },
						username: ctx.user.name,
						resourceId: ctx.user.name
					}
				});
			}
			const updateData = Object.fromEntries(
				Object.entries(user ?? {}).filter(([_, value]) => value !== undefined)
			);

			return await tx.user.update({
				where: {
					name: ctx.user.name
				},
				data: updateData
			});
		});
	}),
	registrationStatus: authProcedure.query(async ({ ctx }) => {
		return await database.user.findUnique({
			where: { name: ctx.user.name },
			select: {
				registrationCompleted: true
			}
		});
	})
});
