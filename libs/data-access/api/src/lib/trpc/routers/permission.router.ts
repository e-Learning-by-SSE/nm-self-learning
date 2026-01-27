import { database } from "@self-learning/database";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";
import { TRPCError } from "@trpc/server";
import { AccessLevel, GroupRole, Prisma } from "@prisma/client";
import { paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { GroupFormSchema } from "@self-learning/types";
import {
	GroupRoleEnum,
	ResourceAccessSchema,
	ResourceInputSchema
} from "../../permissions/permission.types";
import {
	createGroupAccess,
	createResourceAccess,
	getGroup,
	getResourceAccess,
	hasGroupRole,
	hasResourceAccess,
	hasResourcesAccess
} from "../../permissions/permission.service";
import { anyTrue } from "../../permissions/permission.utils";

// function forbidden(message = "Insufficient permissions"): never {
// 	throw new TRPCError({ code: "FORBIDDEN", message });
// }
// function badRequest(message: string): never {
// 	throw new TRPCError({ code: "BAD_REQUEST", message });
// }

// async function testMigration() {
// 	type AuthorCollab = {
// 		userNames: string[];
// 		userIds: string[];
// 		courseIds: string[];
// 		lessonIds: string[];
// 	};
// 	// create a map of unique authors collaborations
// 	const authorCollabs = new Map<string, AuthorCollab>();
// 	// Go for each resource (course & lesson) and get authors
// 	const courses = await database.course.findMany({
// 		select: {
// 			courseId: true,
// 			authors: { select: { user: { select: { id: true, name: true } } } }
// 		}
// 	});
// 	// For each course, build the author collaboration map
// 	for (const course of courses) {
// 		const userNames = course.authors.map(a => a.user.name);
// 		const userIds = course.authors.map(a => a.user.id);
// 		const key = "group-" + (userNames.sort().join("-") || "empty");
// 		const collab = authorCollabs.get(key);
// 		if (!collab) {
// 			// create
// 			authorCollabs.set(key, {
// 				userNames,
// 				userIds,
// 				courseIds: [course.courseId],
// 				lessonIds: []
// 			});
// 		} else {
// 			// update
// 			collab.courseIds.push(course.courseId);
// 		}
// 	}
// 	// Same for lessons
// 	const lessons = await database.lesson.findMany({
// 		select: {
// 			lessonId: true,
// 			authors: { select: { user: { select: { id: true, name: true } } } }
// 		}
// 	});
// 	for (const lesson of lessons) {
// 		const userNames = lesson.authors.map(a => a.user.name);
// 		const userIds = lesson.authors.map(a => a.user.id);
// 		const key = "group-" + (userNames.sort().join("-") || "empty");
// 		const collab = authorCollabs.get(key);
// 		if (!collab) {
// 			// create
// 			authorCollabs.set(key, {
// 				userIds,
// 				userNames,
// 				courseIds: [],
// 				lessonIds: [lesson.lessonId]
// 			});
// 		} else {
// 			// update
// 			collab.lessonIds.push(lesson.lessonId);
// 		}
// 	}
// 	// Log total amount of collabs and members
// 	console.log(`Total unique author collaborations: ${authorCollabs.size}`);
// 	for (const [key, collab] of authorCollabs) {
// 		console.log(
// 			`Collab ${key}: ${collab.userNames.join(", ")} - #Courses: ${collab.courseIds.length}, #Lessons: ${collab.lessonIds.length}`
// 		);
// 	}
// 	// For each author collaboration, create group and permissions
// 	const groups: Prisma.GroupCreateInput[] = [];
// 	for (const [key, collab] of authorCollabs) {
// 		// if no authors, skip
// 		if (collab.userIds.length === 0) continue;
// 		// Must create at least one ADMIN - how?
// 		//
// 		groups.push({
// 			name: key,
// 			members: { create: collab.userIds.map(userId => ({ userId, role: GroupRole.ADMIN })) },
// 			permissions: {
// 				create: [
// 					...collab.courseIds.map(courseId => ({
// 						courseId,
// 						accessLevel: AccessLevel.FULL
// 					})),
// 					...collab.lessonIds.map(lessonId => ({
// 						lessonId,
// 						accessLevel: AccessLevel.FULL
// 					}))
// 				]
// 			}
// 		});
// 	}
// 	console.log(JSON.stringify(groups));
// 	// Bulk create groups
// 	// Clean db
// 	await database.$transaction(async tx => {
// 		await tx.group.deleteMany();
// 		for (const group of groups) {
// 			await tx.group.create({
// 				data: group
// 			});
// 		}
// 	});
// }

export const permissionRouter = t.router({
	// testMigration: t.procedure.mutation(async () => {
	// 	testMigration();
	// }),
	// Can be done by "parent" group admins or website admins
	createGroup: authProcedure
		.input(GroupFormSchema.omit({ id: true }))
		.mutation(async ({ input, ctx }) => {
			const { parent, name, permissions, members } = input;
			const userId = ctx.user.id;
			// check if ADMIN has no limit
			for (const m of members) {
				if (m.role === GroupRole.ADMIN && !!m.expiresAt) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Group ADMIN role cannot expire"
					});
				}
			}
			// map permissions to drop display data
			const perms = permissions.map(p => {
				return ResourceAccessSchema.parse({
					accessLevel: p.accessLevel,
					courseId: p.course?.courseId,
					lessonId: p.lesson?.lessonId
				});
			});
			// for every resource must have FULL access level
			const checks = perms.map(p => {
				return { ...p, accessLevel: AccessLevel.FULL };
			});

			// map members to drop display data
			const membs = members.map(m => {
				return { userId: m.user.id, role: m.role, expiresAt: m.expiresAt };
			});
			// check permission - must have full access at parent or be admin
			let hasAccess = ctx.user.role === "ADMIN";
			if (!hasAccess && !!parent?.id) {
				// only website admins can create root groups
				const [groupOk, resourceOk] = await Promise.all([
					hasGroupRole(parent.id, userId, GroupRole.ADMIN),
					hasResourcesAccess(userId, checks)
				]);
				console.log("groupOk", groupOk, "resourceOk", resourceOk);
				hasAccess = groupOk && resourceOk;
			}

			if (!hasAccess) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			// find if already self added
			const idx = membs.findIndex(m => m.userId === userId);
			if (idx === -1) {
				membs.push({ userId, role: GroupRole.ADMIN, expiresAt: null });
			}
			// create
			return database.group.create({
				data: {
					name,
					parentId: parent?.id,
					permissions: { create: perms },
					members: { create: membs }
				}
			});
		}),
	updateGroup: authProcedure.input(GroupFormSchema).mutation(async ({ input, ctx }) => {
		const { id, permissions, members, name, parent } = input;
		const userId = ctx.user.id;
		if (!id) {
			throw new TRPCError({ code: "BAD_REQUEST", message: "Group id is required" });
		}
		// 3. Group name update
		const { name: oldName, parentId: oldParentId } = await database.group.findUniqueOrThrow({
			where: { id },
			select: { name: true, parentId: true }
		});
		// restrict changing parentId (parent?.id produces undefined !== null)
		if ((parent && parent.id) !== oldParentId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Cannot change parentId of the group"
			});
		}
		// check if update name
		if (name !== oldName) {
			const hasAccess =
				ctx.user.role === "ADMIN" || (await hasGroupRole(id, userId, GroupRole.ADMIN));
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions to update group name"
				});
			}
		}

		// 1. Members
		// check if ADMIN has no limit
		let adminCount = 0;
		for (const m of members) {
			if (m.role === GroupRole.ADMIN) {
				if (m.expiresAt) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Group ADMIN role cannot expire"
					});
				}
				adminCount++;
			}
		}
		// check if at least one ADMIN remains
		if (adminCount === 0) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Group must have ADMIN without expiration"
			});
		}
		// map members to drop display data
		const membs = members.map(m => {
			return { userId: m.user.id, role: m.role, expiresAt: m.expiresAt };
		});
		// fetch old members to check if something changed
		const oldMembers = await database.member.findMany({
			where: { groupId: id },
			select: { userId: true, role: true, expiresAt: true }
		});
		const memberDiffs = new Map(membs.map(m => [m.userId, m]));
		for (const m of oldMembers) {
			const d = memberDiffs.get(m.userId);
			if (!d) {
				// was removed - keep in diffs
				memberDiffs.set(m.userId, m);
			} else if (d.role === m.role && d.expiresAt?.getTime() === m.expiresAt?.getTime()) {
				// if unchanged - ignore
				memberDiffs.delete(m.userId);
			}
		}
		// check if has ADMIN permission (only if members have changed)
		if (memberDiffs.size > 0) {
			const hasAccess =
				ctx.user.role === "ADMIN" || (await hasGroupRole(id, userId, GroupRole.ADMIN));
			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions to update members"
				});
			}
		}

		// 2. Permissions
		// map permissions to drop display data
		const perms = permissions.map(p => {
			return ResourceAccessSchema.parse({
				accessLevel: p.accessLevel,
				courseId: p.course?.courseId,
				lessonId: p.lesson?.lessonId
			});
		});
		// fetch existing permissions to delermine diffs
		const existingPerms = await database.permission.findMany({
			where: { groupId: id },
			select: { lessonId: true, courseId: true, accessLevel: true }
		});
		// compute diffs - deletions and additions/updates
		const toKey = (p: { lessonId?: string | null; courseId?: string | null }) =>
			p.courseId ? `c:${p.courseId}` : `l:${p.lessonId}`;
		const diffs = new Map(perms.map(p => [toKey(p), p]));
		for (const p of existingPerms) {
			const d = diffs.get(toKey(p));
			if (!d) {
				// was removed - add to diffs
				diffs.set(toKey(p), ResourceAccessSchema.parse(p));
			} else if (d.accessLevel === p.accessLevel) {
				// was unchanged - ignore
				diffs.delete(toKey(p));
			}
		}
		// check permission - must have full access at parent or be admin (only if permissions have changed)
		if (diffs.size > 0) {
			// to change resource permission must have FULL access to each
			const checks = Array.from(diffs.values()).map(p => {
				return { ...p, accessLevel: AccessLevel.FULL };
			});
			const hasAccess =
				ctx.user.role === "ADMIN" || (await hasResourcesAccess(userId, checks));

			if (!hasAccess) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Insufficient permissions to update permissions"
				});
			}
		}

		// 4. run update
		return await database.group.update({
			where: { id },
			data: {
				name,
				parentId: parent?.id,
				permissions: {
					deleteMany: {
						OR: [
							// delete course permissions not present in new request
							{
								courseId: {
									notIn: perms.filter(p => p.courseId).map(p => p.courseId!)
								},
								lessonId: null
							},
							// delete lesson permissions not present in new request
							{
								lessonId: {
									notIn: perms.filter(p => p.lessonId).map(p => p.lessonId!)
								},
								courseId: null
							}
						]
					},
					upsert: perms.map(p =>
						p.courseId
							? {
									where: {
										groupId_courseId: { groupId: id, courseId: p.courseId }
									},
									update: { accessLevel: p.accessLevel },
									create: {
										courseId: p.courseId,
										accessLevel: p.accessLevel
									}
								}
							: {
									where: {
										groupId_lessonId: { groupId: id, lessonId: p.lessonId! }
									},
									update: { accessLevel: p.accessLevel },
									create: {
										lessonId: p.lessonId!,
										accessLevel: p.accessLevel
									}
								}
					)
				},
				members: {
					deleteMany: { userId: { notIn: membs.map(m => m.userId) } },
					upsert: membs.map(m => ({
						where: { userId_groupId: { groupId: id, userId: m.userId } },
						update: { role: m.role, expiresAt: m.expiresAt },
						create: m
					}))
				}
			}
		});
	}),
	deleteGroup: authProcedure
		.input(z.object({ groupId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const { groupId } = input;
			const userId = ctx.user.id;
			// check if user is group admin or website admin
			const isOwner =
				ctx.user.role === "ADMIN" || (await hasGroupRole(groupId, userId, GroupRole.ADMIN));
			if (!isOwner) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			// delete group
			return await database.group.delete({ where: { id: groupId } });
		}),
	getResourceAccess: authProcedure.input(ResourceAccessSchema).query(async ({ input, ctx }) => {
		const userId = ctx.user.id;
		return await getResourceAccess({ userId, ...input });
	}),
	hasResourceAccess: authProcedure.input(ResourceAccessSchema).query(async ({ input, ctx }) => {
		if (ctx.user.role === "ADMIN") return true;
		return await hasResourceAccess({ userId: ctx.user.id, ...input });
	}),
	// Done by group admins or website admins
	grantGroupAccess: authProcedure
		.input(
			z.object({
				groupId: z.number(),
				userId: z.string(),
				role: GroupRoleEnum,
				durationMinutes: z.number().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { groupId, userId, role, durationMinutes } = input;
			const grantorId = ctx.user.id; // grantor
			// first check if grantor has ADMIN permission
			const hasAccess =
				ctx.user.role === "ADMIN" ||
				(await hasGroupRole(groupId, grantorId, GroupRole.ADMIN));
			if (!hasAccess) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			// now add user to the group
			return await createGroupAccess(groupId, userId, role, durationMinutes);
			// TODO make log of access created
		}),
	hasGroupRole: authProcedure
		.input(z.object({ groupId: z.number(), role: GroupRoleEnum }))
		.query(async ({ input, ctx }) => {
			if (ctx.user.role === "ADMIN") return true;
			return await hasGroupRole(input.groupId, ctx.user.id, input.role);
		}),
	// Done by resource owners or website admins
	grantGroupPermission: authProcedure
		.input(z.object({ groupId: z.number(), permission: ResourceAccessSchema }))
		.mutation(async ({ input, ctx }) => {
			const { groupId, permission } = input;
			const userId = ctx.user.id; // grantor
			// check if grantor has FULL access level to that resource (does not need to be in the group)
			const hasAccess =
				ctx.user.role === "ADMIN" ||
				(await hasResourceAccess({ userId, ...permission, accessLevel: AccessLevel.FULL }));
			if (!hasAccess) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			// now create new permission
			return await createResourceAccess({ groupId, ...permission });
			// TODO make log of permission created
		}),
	// Done by resource owners, grantor group admins, group admins, or website admins
	revokeGroupPermission: authProcedure
		.input(z.object({ permissionId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const { permissionId } = input;
			const userId = ctx.user.id;
			// fetch permission which is revoked
			const perm = await database.permission.findUnique({
				where: { id: permissionId },
				select: { groupId: true, courseId: true, lessonId: true }
			});
			if (!perm) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Invalid permission" });
			}
			const data = ResourceInputSchema.parse(perm);

			// can revoke if has full access to resource or group admin
			let hasAccess = ctx.user.role === "ADMIN";
			if (!hasAccess) {
				hasAccess = await anyTrue([
					() => hasGroupRole(perm.groupId, userId, GroupRole.ADMIN),
					() => hasResourceAccess({ userId, accessLevel: AccessLevel.FULL, ...data })
				]);
			}
			if (!hasAccess) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			// delete permission
			return await database.permission.delete({ where: { id: permissionId } });
			// TODO make log of permission revoked
		}),
	// Done by group admins or website admins
	revokeGroupAccess: authProcedure
		.input(z.object({ userId: z.string(), groupId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.user.id;
			// fetch membership which is revoked
			const membership = await database.member.findUnique({
				where: { userId_groupId: input },
				select: { groupId: true, userId: true, role: true }
			});
			if (!membership) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Invalid membership" });
			}
			// check if user has ADMIN role in that group
			const hasAccess =
				ctx.user.role === "ADMIN" ||
				(await hasGroupRole(membership.groupId, userId, GroupRole.ADMIN));
			if (!hasAccess) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
			}
			// delete membership
			return await database.member.delete({ where: { userId_groupId: input } });
			// TODO make log of access revoked
		}),
	// deletePermission: adminProcedure
	// 	.input(z.object({ permissionId: z.string() }))
	// 	.mutation(async ({ input }) => {
	// 		const { permissionId } = input;
	// 		return await database.permission.delete({ where: { id: permissionId } });
	// 	}),
	getGroup: authProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
		const hasAccess =
			ctx.user.role === "ADMIN" ||
			(await hasGroupRole(input.id, ctx.user.id, GroupRole.MEMBER));
		return hasAccess ? await getGroup(input.id) : null;
	}),
	findMyGroups: authProcedure.input(paginationSchema).query(async ({ input, ctx }) => {
		const pageSize = 15;
		const userId = ctx.user.id;

		const where: Prisma.GroupWhereInput = {
			members: { some: { userId } }
		};

		const [groupsRaw, count] = await database.$transaction([
			database.group.findMany({
				include: {
					members: {
						select: { user: { select: { name: true } } }
					}
				},
				...paginate(pageSize, input.page),
				orderBy: { name: "asc" },
				where
			}),
			database.group.count({ where })
		]);
		// flatten result
		const result = groupsRaw.map(g => ({
			groupId: g.id,
			name: g.name,
			members: g.members.map(m => m.user.name)
		}));

		return {
			result,
			pageSize: pageSize,
			page: input.page,
			totalCount: count
		} satisfies Paginated<unknown>;
	}),
	findGroups: t.procedure
		.input(
			paginationSchema.extend({
				name: z.string().optional(),
				authorName: z.string().optional()
			})
		)
		.query(async ({ input }) => {
			const pageSize = 15;

			const where: Prisma.GroupWhereInput = {
				name:
					input.name && input.name.length > 0
						? { contains: input.name, mode: "insensitive" }
						: undefined,
				members: input.authorName
					? {
							some: {
								user: { name: { contains: input.authorName, mode: "insensitive" } }
							}
						}
					: undefined
			};

			const [groupsRaw, count] = await database.$transaction([
				database.group.findMany({
					include: {
						members: {
							select: { user: { select: { name: true } } }
						}
					},
					...paginate(pageSize, input.page),
					orderBy: { name: "asc" },
					where
				}),
				database.group.count({ where })
			]);
			// flatten result
			const result = groupsRaw.map(g => ({
				groupId: g.id,
				name: g.name,
				members: g.members.map(m => m.user.name)
			}));

			return {
				result,
				pageSize: pageSize,
				page: input.page,
				totalCount: count
			} satisfies Paginated<unknown>;
		})
});
