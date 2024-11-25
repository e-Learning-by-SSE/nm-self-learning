import { database } from "@self-learning/database";
import { authProcedure, t } from "../trpc";
import { findLessons } from "./lesson.router";
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
	updateSettings: authProcedure.input(editUserSettingsSchema).mutation(async ({ ctx, input }) => {
		await database.$transaction(async tx => {
			const dbSettings = await tx.user.findUnique({
				where: {
					name: ctx.user.name
				}
			});
			const { user } = input;
			if (
				(user &&
					dbSettings?.enabledFeatureLearningDiary !== user.enabledFeatureLearningDiary) ??
				dbSettings?.enabledFeatureLearningDiary
			) {
				await tx.eventLog.create({
					data: {
						type: "LTB_TOGGLE",
						payload: { enabled: user!.enabledFeatureLearningDiary },
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
	})
});
