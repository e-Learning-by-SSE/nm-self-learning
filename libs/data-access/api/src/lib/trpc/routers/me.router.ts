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
import { Session } from "next-auth";
import { Prisma, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

function isAdmin(user: Session["user"]) {
	return user.role === "ADMIN";
}

async function updateUserFeatures(
	user: Session["user"],
	input: EditFeatureSettings,
	client: PrismaClient | Prisma.TransactionClient = database
) {
	console.log("user", user);
	if (input.experimental != null && !isAdmin(user)) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin permission for experimental change is necessary"
		});
	}

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
				memberships: {
					select: {
						role: true,
						group: {
							select: {
								name: true,
								permissions: {
									select: {
										accessLevel: true,
										course: { select: { courseId: true, title: true } },
										lesson: { select: { lessonId: true, title: true } }
									}
								}
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
				include: { author: true }
			});

			if (!user) {
				return false;
			}

			const anonymousUsername = "anonymous-" + randomUUID();

			await tx.user.create({
				data: { name: anonymousUsername, displayName: "Deleted User", role: "USER" }
			});

			if (user.author) {
				await tx.author.update({
					where: { username: user.name },
					data: { username: anonymousUsername, slug: anonymousUsername }
				});
			}

			await tx.skillRepository.updateMany({
				where: { ownerName: user.name },
				data: { ownerName: anonymousUsername }
			});

			await tx.eventLog.updateMany({
				where: { username: user.name },
				data: { username: anonymousUsername }
			});

			await tx.user.delete({ where: { name: ctx.user.name } });

			return true;
		});
	}),
	update: authProcedure.input(editUserSchema).mutation(async ({ ctx, input }) => {
		await database.$transaction(async tx => {
			const updateData = Object.fromEntries(
				Object.entries(input.user ?? {}).filter(([_, value]) => value !== undefined)
			);
			console.warn("Updating user settings", updateData);

			return await tx.user.update({ where: { name: ctx.user.name }, data: updateData });
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
