import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";
import { userSchema } from "@self-learning/types";
import { deleteUser, deleteUserAndDependentData } from "@self-learning/admin";
import { GroupRoleEnum } from "../../permissions/permission.types";

export const adminRouter = t.router({
	findUsers: authProcedure
		.input(
			paginationSchema.extend({ name: z.string().optional(), email: z.string().optional() })
		)
		.query(async ({ input }) => {
			const page = input.page;
			const pageSize = 15;

			const where: Prisma.UserWhereInput = {
				name: input.name
					? {
							contains: input.name,
							mode: "insensitive"
						}
					: undefined,
				email: input.email
					? {
							contains: input.email
						}
					: undefined
			};

			const [result, totalCount] = await database.$transaction([
				database.user.findMany({
					where,
					select: {
						id: true,
						name: true,
						displayName: true,
						email: true,
						role: true,
						image: true
					},
					orderBy: {
						name: "asc"
					},
					...paginate(pageSize, page)
				}),
				database.user.count({ where })
			]);

			return { result, totalCount, page, pageSize } satisfies Paginated<unknown>;
		}),
	getUser: adminProcedure.input(z.string()).query(async ({ input }) => {
		return database.user.findUniqueOrThrow({
			where: { name: input },
			select: {
				id: true,
				name: true,
				displayName: true,
				email: true,
				emailVerified: true,
				role: true,
				image: true,
				author: true,
				student: true,
				registrationCompleted: true,
				notificationSettings: true,
				acceptedExperimentTerms: true,
				declinedExperimentTerms: true,
				featureFlags: true
			}
		});
	}),
	deleteUserAndDependentData: adminProcedure.input(z.string()).mutation(async ({ input }) => {
		const username = input;
		return await deleteUserAndDependentData(username, database);
	}),
	deleteUser: adminProcedure.input(z.string()).mutation(async ({ input }) => {
		const username = input;
		return await deleteUser(username, database);
	}),
	updateUser: adminProcedure
		.input(
			z.object({
				username: z.string(),
				user: userSchema
			})
		)
		.mutation(async ({ input }) => {
			const { username, user } = input;
			const updated = await database.user.update({
				where: { name: username },
				data: user
			});

			return updated;
		}),
	promoteToAuthor: adminProcedure
		.input(
			z.object({
				username: z.string(),
				role: GroupRoleEnum,
				group: z.union([
					z.object({
						id: z.number()
					}), 
					z.object({
						name: z.string().min(3), 
						slug: z.string().min(3)
					})]).optional()
			})
		)
		.mutation(async ({ input }) => {
			const user = await database.user.findUniqueOrThrow({
				where: { name: input.username },
				select: {
					id: true,
					name: true,
					image: true,
					author: true
				}
			});

			if (user.author) {
				throw new TRPCError({
					code: "CONFLICT",
					message: `User "${input.username}" is already an author.`
				});
			}

			const result = await database.$transaction(async (tx) => {
				const created = await tx.author.create({
					data: {
						username: user.name,
						displayName: user.name,
						slug: user.name,
						imgUrl: user.image
					}
				});

				console.log("[adminRouter.promoteToAuthor] tx: created author:", created);

				if (input.group) {
					if ("id" in input.group) {
						// Link to existing group
						const groupId = input.group.id;
						const group = await tx.group.findUnique({
							where: { id: groupId }
						});
						if (!group) {
							throw new TRPCError({
								code: "NOT_FOUND",
								message: `Group with id ${groupId} not found.`
							});
						}
						const existingRole = await tx.member.findFirst({
							where: { 
								userId: user.id, 
								groupId, 
								OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] 
							},
							select: { role: true }
						});
						if (existingRole) {
							throw new TRPCError({
								code: "CONFLICT",
								message: `User "${input.username}" is already a member of the group.`
							});
						}
						await tx.member.create({
							data: {
								groupId,
								userId: user.id,
								role: input.role,
								expiresAt: null
							}
						});
					} else {
						// Create new group
						await tx.group.create({
							data: {
								name: input.group.name,
								slug: input.group.slug,
								members: {
									create: {
										userId: user.id,
										role: input.role,
										expiresAt: null
									}
								}
							}
						});
					}
				}

				return created;
			});

			return result;
		}),
	getAccessToken: adminProcedure.query(async input => {
		console.log("[adminRouter.getAccessToken] input.ctx.user", input.ctx.user);
		return database.account.findFirst({
			where: { userId: input.ctx.user.id },
			select: {
				access_token: true
			}
		});
	})
});
