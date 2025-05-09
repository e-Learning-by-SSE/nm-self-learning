import { database } from "@self-learning/database";
import { authProcedure, t } from "../trpc";
import { z } from "zod";
import { AudienceType, Prisma } from "@prisma/client";

async function getNotifications(userId: string, tx?: Prisma.TransactionClient) {
	const client = tx ?? database;
	const notifications = await client.notification.findMany({
		where: {
			AND: [
				{
					OR: [
						{ targetAudience: AudienceType.all }, // TODO here we can add a check which audience the user belongs to and not all
						{ targets: { some: { userId: userId } } }
					]
				},
				{
					NOT: {
						targets: {
							some: {
								userId: userId,
								dismissed: true,
								seenAt: { not: undefined }
							}
						}
					}
				},
				{
					displayFrom: { lte: new Date() },
					displayUntil: { gte: new Date() }
				}
			]
		},
		orderBy: {
			displayFrom: "desc"
		}
	});
	return notifications;
}

async function upsertNotification({
	notificationId,
	userId,
	dismissed = false
}: {
	notificationId: string;
	userId: string;
	dismissed?: boolean;
}) {
	return database.notificationUser.upsert({
		where: {
			notificationId_userId: {
				notificationId,
				userId
			}
		},
		create: {
			user: { connect: { id: userId } },
			notification: { connect: { id: notificationId } },
			dismissed
		},
		update: {
			seenAt: new Date(),
			dismissed
		}
	});
}

export const notificationRouter = t.router({
	markAsSeen: authProcedure
		.input(z.object({ notificationId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.user.id;
			return upsertNotification({ notificationId: input.notificationId, userId });
		}),

	markAsDismissed: authProcedure
		.input(z.object({ notificationId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.user.id;
			return upsertNotification({
				notificationId: input.notificationId,
				userId,
				dismissed: true
			});
		}),
	getOwn: authProcedure.query(async ({ ctx }) => {
		const userId = ctx.user.id;
		return getNotifications(userId);
	}),
	delete: authProcedure
		.input(z.object({ notificationIds: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			return await database.$transaction(async tx => {
				const userId = ctx.user.id;
				const notificationId = input.notificationIds[0];

				// Step 1: Get the notification to check its audience type
				const notification = await tx.notification.findUniqueOrThrow({
					where: { id: notificationId },
					include: { targets: true }
				});

				// Step 2: Delete the user from the notificationUser table
				await tx.notificationUser.delete({
					where: {
						notificationId_userId: {
							notificationId,
							userId
						}
					}
				});

				// Step 3: Check if this was the only target and if audience type is 'user'
				if (
					notification.targetAudience === "user" &&
					notification.targets.length === 1 &&
					notification.targets[0].userId === userId
				) {
					// If conditions met, delete the entire notification
					await tx.notification.delete({
						where: { id: notificationId }
					});
				}
			});
		})
});
