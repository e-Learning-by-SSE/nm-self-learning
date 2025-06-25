import { database } from "@self-learning/database";
import {
	createUserParticipation,
	getExperimentStatus,
	updateExperimentParticipation
} from "@self-learning/profile";
import {
	EditFeatureSettings,
	editFeatureSettingsSchema,
	editUserSchema
} from "@self-learning/types";
import { randomUUID } from "crypto";
import { z } from "zod";
import { authProcedure, t } from "../trpc";
import { findLessons } from "./lesson.router";
import { Session } from "next-auth";
import { Prisma, PrismaClient } from "@prisma/client";

async function updateUserFeatures(
	user: Session["user"],
	input: EditFeatureSettings,
	client: PrismaClient | Prisma.TransactionClient = database
) {
	const isFeatureLearningDiaryChanged = user?.featureFlags?.learningDiary !== input.learningDiary;
	const isUserDefined = user !== undefined;
	const shouldLogEvent = isUserDefined && isFeatureLearningDiaryChanged;
	if (shouldLogEvent) {
		await client.eventLog.create({
			data: {
				type: "LTB_TOGGLE",
				payload: { enabled: user.featureFlags?.learningDiary },
				username: user.name,
				resourceId: user.name
			}
		});
	}

	return client.features.update({
		where: { userId: user.id },
		data: input
	});
}

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
	update: authProcedure.input(editUserSchema).mutation(async ({ ctx, input }) => {
		await database.$transaction(async tx => {
			editUserSchema;
			const updateData = Object.fromEntries(
				Object.entries(input.user ?? {}).filter(([_, value]) => value !== undefined)
			);
			console.warn("Updating user settings", updateData);

			return await tx.user.update({
				where: {
					name: ctx.user.name
				},
				data: updateData
			});
		});
	}),

	updateFeatureFlags: authProcedure
		.input(editFeatureSettingsSchema)
		.mutation(async ({ ctx, input }) => {
			return updateUserFeatures(ctx.user, input);
		}),

	getRegistrationStatus: authProcedure.query(async ({ ctx }) => {
		return database.user.findUnique({
			where: { name: ctx.user.name },
			select: {
				registrationCompleted: true
			}
		});
	}),

	completeRegistration: authProcedure
		.input(editFeatureSettingsSchema)
		.mutation(async ({ ctx, input }) => {
			await database.$transaction(async tx => {
				await tx.user.update({
					where: { name: ctx.user.name },
					data: {
						registrationCompleted: true
					}
				});
				await updateUserFeatures(
					ctx.user,
					{
						...input
					},
					tx
				);
			});
		}),
	// TODO [MS-MA]: remove this when the feature is stable
	submitExperimentConsent: authProcedure
		.input(
			z.object({
				consent: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { user } = ctx;
			const { consent } = input;

			if (!consent) {
				return updateExperimentParticipation({
					username: user.name,
					consent: false
				});
			} else {
				return createUserParticipation(user.name);
			}
		}),
	getExperimentStatus: authProcedure.query(async ({ ctx }) => {
		const { user } = ctx;
		return getExperimentStatus(user.name);
	})
});
