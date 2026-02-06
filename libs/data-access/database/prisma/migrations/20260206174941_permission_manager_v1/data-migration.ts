import {
	AccessLevel,
	GroupRole,
	NotificationChannel,
	NotificationType,
	Prisma,
	PrismaClient
} from "@prisma/client";
import { CourseContent } from "../../../../../util/types/src";

const prisma = new PrismaClient();

type AuthorCollab = {
	userNames: string[];
	userIds: string[];
	courseIds: string[];
	lessonIds: string[];
};

export async function migrateAutorsToGroups(tx: Prisma.TransactionClient): Promise<void> {
	// create a map of unique authors collaborations
	const authorCollabs = new Map<string, AuthorCollab>();
	// Go for each resource (course & lesson) and get authors
	const courses = await tx.course.findMany({
		select: {
			courseId: true,
			authors: { select: { user: { select: { id: true, name: true } } } }
		}
	});
	// For each course, build the author collaboration map
	for (const course of courses) {
		const userNames = course.authors.map(a => a.user.name);
		const userIds = course.authors.map(a => a.user.id);
		const key = "group-" + (userNames.sort().join("-") || "empty");
		const collab = authorCollabs.get(key);
		if (!collab) {
			// create
			authorCollabs.set(key, {
				userNames,
				userIds,
				courseIds: [course.courseId],
				lessonIds: []
			});
		} else {
			// update
			collab.courseIds.push(course.courseId);
		}
	}
	// Same for lessons
	const lessons = await tx.lesson.findMany({
		select: {
			lessonId: true,
			authors: { select: { user: { select: { id: true, name: true } } } }
		}
	});
	for (const lesson of lessons) {
		const userNames = lesson.authors.map(a => a.user.name);
		const userIds = lesson.authors.map(a => a.user.id);
		const key = "group-" + (userNames.sort().join("-") || "empty");
		const collab = authorCollabs.get(key);
		if (!collab) {
			// create
			authorCollabs.set(key, {
				userIds,
				userNames,
				courseIds: [],
				lessonIds: [lesson.lessonId]
			});
		} else {
			// update
			collab.lessonIds.push(lesson.lessonId);
		}
	}
	// Log total amount of collabs and members
	console.log(`Total unique author collaborations: ${authorCollabs.size}`);
	for (const [key, collab] of authorCollabs) {
		console.log(
			`Collab ${key}: ${collab.userNames.join(", ")} - #Courses: ${collab.courseIds.length}, #Lessons: ${collab.lessonIds.length}`
		);
	}
	// For each author collaboration, create group and permissions
	const groups: Prisma.GroupCreateInput[] = [];
	for (const [key, collab] of authorCollabs) {
		// if no authors, skip
		if (collab.userIds.length === 0) continue;
		// Must create at least one ADMIN - how?
		//
		groups.push({
			name: key,
			members: { create: collab.userIds.map(userId => ({ userId, role: GroupRole.ADMIN })) },
			permissions: {
				create: [
					...collab.courseIds.map(courseId => ({
						courseId,
						accessLevel: AccessLevel.FULL
					})),
					...collab.lessonIds.map(lessonId => ({
						lessonId,
						accessLevel: AccessLevel.FULL
					}))
				]
			}
		});
	}
	console.log(JSON.stringify(groups));
	// Bulk create groups
	// Clean db
	await tx.group.deleteMany();
	for (const group of groups) {
		await tx.group.create({
			data: group
		});
	}
}

export async function linkLessonsToCourses(tx: Prisma.TransactionClient): Promise<void> {
	const courses = await tx.course.findMany();
	for (const course of courses) {
		const content = (course.content ?? []) as CourseContent;
		for (const chapter of content) {
			for (const lesson of chapter.content) {
				const existingLesson = await tx.lesson.findUnique({
					where: { lessonId: lesson.lessonId }
				});
				if (!existingLesson) {
					console.warn(
						`ERROR: Lesson id ${lesson.lessonId} which is linked to course ${course.courseId}, does not exist!`
					);
					continue;
				}
				if (existingLesson.courseId) {
					console.warn(
						`ERROR: Lesson ${lesson.lessonId} is already linked to another course ${existingLesson.courseId}, skipping`
					);
					continue;
				}
				// if integrity of db here
				await tx.lesson.update({
					where: {
						lessonId: lesson.lessonId
					},
					data: {
						courseId: course.courseId
					}
				});
			}
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
			await linkLessonsToCourses(tx);
		});
	} finally {
		await prisma.$disconnect();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
