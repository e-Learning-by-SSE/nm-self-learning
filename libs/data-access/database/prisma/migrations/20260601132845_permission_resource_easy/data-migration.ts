/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	AccessLevel,
	GroupRole,
	NotificationChannel,
	NotificationType,
	Prisma,
	PrismaClient
} from "@prisma/client";

const prisma = new PrismaClient();

/**
 * **Permission Resource Migration Script.**
 */
type AuthorCollab = {
	groupId?: number;
	userNames: string[];
	userIds: string[];
	specializationIds: string[];
	subjectIds: string[];
};

/**
 * **Permission Resource Migration Script.**
 *
 * This migration script is designed to migrate authors to groups and update permissions accordingly.
 * It creates a map of unique author collaborations, checks for existing groups, and either updates existing groups or creates new ones based on the authors' collaborations.
 * It also logs the total number of unique author collaborations and their associated specializations and subjects.
 */
export async function migrateAuthorsToGroups(tx: Prisma.TransactionClient): Promise<void> {
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

/**
 * **Permission Resource Migration Script.**
 */
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

/**
 * **Permission Resource Migration Script.**
 */
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

/**
 * **Permission Resource Migration Script.**
 */
async function migratePermissionResources() {
	try {
		await prisma.$transaction(async tx => {
			await migrateAuthorsToGroups(tx);
		});
	} finally {
		await prisma.$disconnect();
	}
}

/**
 * **Arrange Migration Script.**
 *
 * Minimal alternative of QuizContent that supports also
 * legacy arrange questions that are missing the categoryOrder property.
 */
type LegacyQuizContent = {
	questions?: Array<{
		type?: string;
		categoryOrder?: unknown;
	}>;
	questionOrder?: string[];
};

/**
 * **Arrange Migration Script.**
 *
 * Relevant properties of a lesson that are needed for the migration.
 */
type LessonWithQuiz = {
	lessonId: string;
	quiz: LegacyQuizContent;
};

/**
 * **Arrange Migration Script.**
 *
 * Filters lessons that have at least one arrange question that is missing the categoryOrder property
 * and need to be fixed.
 */
function hasDefectiveArrangeQuestion(lesson: unknown): boolean {
	const quiz = (lesson as { quiz?: unknown }).quiz;
	if (!quiz || typeof quiz !== "object") {
		return false;
	}

	const content = quiz as LegacyQuizContent;

	if (!Array.isArray(content.questions)) {
		return false;
	}

	return content.questions.some(question => {
		return question.type === "arrange" && !("categoryOrder" in question);
	});
}

/**
 * **Arrange Migration Script.**
 *
 * Adds the missing categoryOrder property to arrange questions to fix them.
 */
function fixLessonQuiz(lesson: LessonWithQuiz): LessonWithQuiz {
	if (!lesson.quiz.questions) {
		return lesson;
	}

	for (const question of lesson.quiz.questions) {
		if (question.type === "arrange" && !("categoryOrder" in question)) {
			const items = (question as any).items;

			if (items && typeof items === "object" && !Array.isArray(items)) {
				(question as any).categoryOrder = Object.keys(items);
			}
		}
	}

	return lesson;
}

/**
 * **Arrange Migration Script.**
 *
 * Full repair implementation:
 * Filters for broken arrange questions, applies the fix, and updates the lessons in the database.
 */
async function migrateArrangeQuestions() {
	const allLessons = await prisma.lesson.findMany();

	const patchedLessons = allLessons
		.filter(hasDefectiveArrangeQuestion)
		.map(lesson => fixLessonQuiz(lesson as unknown as LessonWithQuiz));

	if (patchedLessons.length > 0) {
		console.log(
			`Created patches for \x1b[31m${patchedLessons.length}\x1b[0m lessons with arrange questions that missed categoryOrder.`
		);
		for (const lesson of patchedLessons) {
			await prisma.lesson.update({
				where: { lessonId: lesson.lessonId },
				data: { quiz: lesson.quiz as any }
			});
		}

		console.log(`\x1b[32mSuccessfully applied all ${patchedLessons.length} patches.\x1b[0m`);
	} else {
		console.log(`\x1b[32mNo lessons with broken arrange questions found.\x1b[0m`);
	}
}

async function main() {
	await migratePermissionResources();
	await migrateArrangeQuestions();
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
