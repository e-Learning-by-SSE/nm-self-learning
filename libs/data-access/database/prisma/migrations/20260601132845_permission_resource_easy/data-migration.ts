import {
	AccessLevel,
	GroupRole,
	NotificationChannel,
	NotificationType,
	Prisma,
	PrismaClient
} from "@prisma/client";

const prisma = new PrismaClient();

type AuthorCollab = {
	groupId?: number;
	userNames: string[];
	userIds: string[];
	specializationIds: string[];
	subjectIds: string[];
};

export async function migrateAutorsToGroups(tx: Prisma.TransactionClient): Promise<void> {
	// create a map of unique authors collaborations
	const authorCollabs = new Map<string, AuthorCollab>();
	// groups already exist, do attach matching groups by members
	const existingCollabs = await tx.group.findMany({
		include: {
			members: {
				include: {
					user: {
						select: {
							id: true,
							name: true
						}
					}
				}
			}
		}
	});
	for (const collab of existingCollabs) {
		const userNames = collab.members.map(m => m.user.name);
		const userIds = collab.members.map(m => m.user.id);
		const key = "group-" + (userNames.sort().join("-") || "empty");
		authorCollabs.set(key, {
			groupId: collab.id,
			userNames,
			userIds,
			specializationIds: [],
			subjectIds: []
		});
	}
	// Go for each resource (specialization & subject) and get admins
	const specializations = await tx.specialization.findMany({
		select: {
			specializationId: true,
			specializationAdmin: {
				select: { author: { select: { user: { select: { id: true, name: true } } } } }
			}
		}
	});
	// For each specialization, build the author collaboration map
	for (const specialization of specializations) {
		const userNames = specialization.specializationAdmin.map(admin => admin.author.user.name);
		const userIds = specialization.specializationAdmin.map(admin => admin.author.user.id);
		const key = "group-" + (userNames.sort().join("-") || "empty");
		const collab = authorCollabs.get(key);
		if (!collab) {
			// create
			authorCollabs.set(key, {
				groupId: undefined,
				userNames,
				userIds,
				specializationIds: [specialization.specializationId],
				subjectIds: []
			});
		} else {
			// update
			collab.specializationIds.push(specialization.specializationId);
		}
	}
	// Same for subjects
	const subjects = await tx.subject.findMany({
		select: {
			subjectId: true,
			subjectAdmin: {
				select: { author: { select: { user: { select: { id: true, name: true } } } } }
			}
		}
	});
	for (const subject of subjects) {
		const userNames = subject.subjectAdmin.map(admin => admin.author.user.name);
		const userIds = subject.subjectAdmin.map(admin => admin.author.user.id);
		const key = "group-" + (userNames.sort().join("-") || "empty");
		const collab = authorCollabs.get(key);
		if (!collab) {
			// create
			authorCollabs.set(key, {
				userIds,
				userNames,
				specializationIds: [],
				subjectIds: [subject.subjectId]
			});
		} else {
			// update
			collab.subjectIds.push(subject.subjectId);
		}
	}
	// Log total amount of collabs and members
	console.log(
		`Total unique author collaborations: ${authorCollabs.size} (new groups to create: ${[...authorCollabs.values()].filter(c => !c.groupId).length})`
	);
	for (const [key, collab] of authorCollabs) {
		console.log(
			`${collab.groupId || "new"} collab ${key}: ${collab.userNames.join(", ")} - #Specializations: ${collab.specializationIds.length}, #Subjects: ${collab.subjectIds.length}`
		);
	}
	//
	for (const [key, collab] of authorCollabs) {
		if (collab.userIds.length === 0) continue;
		if (collab.groupId) {
			const groupId = collab.groupId;
			// UPDATE existing group permissions
			if (collab.specializationIds.length > 0) {
				await tx.permission.createMany({
					data: collab.specializationIds.map(specializationId => ({
						groupId,
						specializationId,
						accessLevel: AccessLevel.FULL
					})),
					skipDuplicates: true
				});
			}

			if (collab.subjectIds.length > 0) {
				await tx.permission.createMany({
					data: collab.subjectIds.map(subjectId => ({
						groupId,
						subjectId,
						accessLevel: AccessLevel.FULL
					})),
					skipDuplicates: true
				});
			}
		} else {
			// CREATE entirely new group
			await tx.group.create({
				data: {
					name: key,
					slug: key,
					members: {
						create: collab.userIds.map(userId => ({
							userId,
							role: GroupRole.ADMIN
						}))
					},
					permissions: {
						create: [
							...collab.specializationIds.map(specializationId => ({
								specializationId,
								accessLevel: AccessLevel.FULL
							})),
							...collab.subjectIds.map(subjectId => ({
								subjectId,
								accessLevel: AccessLevel.FULL
							}))
						]
					}
				}
			});
		}
	}
}

export function getDefaultNotificationData(defaultValue?: boolean) {
	const types = Object.values(NotificationType);
	const channels = Object.values(NotificationChannel);
	return types.flatMap(type =>
		channels.map(channel => ({
			type,
			channel,
			enabled: defaultValue // if undefined -> prisma default
		}))
	);
}

export async function createInitialNotificationSettings(
	user: { id: string },
	client: Prisma.TransactionClient | PrismaClient
) {
	await client.userNotificationSetting.createMany({
		data: getDefaultNotificationData().map(setting => ({
			...setting,
			userId: user.id,
			id: crypto.randomUUID()
		}))
	});
}

async function main() {
	try {
		await prisma.$transaction(async tx => {
			await migrateAutorsToGroups(tx);
		});
	} finally {
		await prisma.$disconnect();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
