import { PrismaClient } from "@prisma/client";
import { database } from "@self-learning/database";
import {
	getRandomItemsFromArray, getRandomNumber
} from "../../seed-functions";
import { InputJsonValue } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

interface LessonId {
	lessonId: string;
}

interface CourseContent {
	content: LessonId[];
}

export async function generateEventlogDate() {
	console.log("\x1b[94m%s\x1b[0m", "Eventlog Example:");

	try {
		// Ensure the student "Dumbledore" exists in the database
		const student = await prisma.student.findUnique({
			where: { username: "dumbledore" }
		});

		if (!student) {
			console.error('Student "Dumbledore" not found.');
			return;
		}

		await seedCourseEvents({
			courseSlug: "objectorientierte-programmierung-mit-java",
			startTime: new Date(),
			username: student.username
		});

	} catch (error) {
		console.error("Error generating demo data:", error);
	} finally {
		await prisma.$disconnect();
	}
}

async function seedCourseEvents({ courseSlug, startTime, username }: {
	courseSlug: string,
	startTime: Date,
	username: string
}) {

	const course = await prisma.course.findFirst({ where: { slug: courseSlug } })

	if (!course || !course.content) {
		console.error("No courses found.");
		return;
	}

	const courseSections: CourseContent[] = JSON.parse(JSON.stringify(course.content));

	const lessonsIds: string[] = [];

	courseSections.forEach(value => {
		lessonsIds.push(...value.content.map(lesson => lesson.lessonId));
	});

	await prisma.eventLog.create({ data: { type: "USER_LOGIN", username, createdAt: startTime } })

	// Add 5 Minutes
	let createdAt: Date = new Date(startTime.getTime() + 5 * 60 * 1000);

	await prisma.eventLog.create({
		data: {
			type: "COURSE_ENROLL",
			courseId: course.courseId,
			resourceId: course.courseId,
			username,
			createdAt
		}
	})

	// Add 5 Minutes
	createdAt = new Date(startTime.getTime() + 5 * 60 * 1000);

	await prisma.eventLog.create({
		data: {
			type: "COURSE_START",
			courseId: course.courseId,
			resourceId: course.courseId,
			username,
			createdAt
		}
	})

	createdAt = new Date(startTime.getTime() + 60 * 1000);

	const ltbPage = await prisma.learningDiaryPage.create({
		data: {
			studentName: username,
			courseSlug: course.slug,
			createdAt
		}
	})

	for (const lessonId of lessonsIds) {
		// Add 5 Minutes
		createdAt = new Date(createdAt.getTime() + 5 * 60 * 1000);

		createdAt = await seedLessonEvents({
			lessonId,
			courseId: course.courseId,
			createdAt,
			entryId: ltbPage.id,
			username
		});
	}

	await prisma.eventLog.create({
		data: {
			type: "COURSE_COMPLETE",
			courseId: course.courseId,
			resourceId: course.courseId,
			username,
			createdAt,
			payload: {}
		}
	});

	createdAt = new Date(createdAt.getTime() + 60 * 1000);

	await prisma.eventLog.create({
		data: {
			type: "USER_LOGOUT",
			courseId: course.courseId,
			resourceId: course.courseId,
			username,
			createdAt,
			payload: {}
		}
	});
}

function removeConfig(quiz: any): any {
	if (Object.prototype.hasOwnProperty.call(quiz, 'config')) {
		delete quiz.config;
	}

	return quiz;
}

async function seedLessonEvents({ lessonId, courseId, createdAt, entryId, username }: {
	lessonId: string,
	courseId: string,
	createdAt: Date,
	entryId: string,
	username: string
}) {

	const lesson = await prisma.lesson.findFirst({ where: { lessonId } });
	const quizes = removeConfig(JSON.parse(JSON.stringify(lesson?.quiz)));

	await prisma.eventLog.create({
		data: {
			type: "LESSON_OPEN",
			courseId,
			resourceId: lessonId,
			username,
			createdAt
		}
	})

	// Add 1 Minute
	createdAt = new Date(createdAt.getTime() + 60 * 1000);
	await database.learningDiaryLearnedLessons.create({
		data: { entryId: entryId, lessonId: lessonId, createdAt: createdAt }
	});

	// Adds 5 Minutes
	createdAt = new Date(createdAt.getTime() + 5 * 60 * 1000);

	for (const quiz in quizes) {
		createdAt = await seedQuizEvents({ lessonId, courseId, createdAt, entryId, username, quiz })
	}

	createdAt = new Date(createdAt.getTime() + 60 * 1000);

	const completedLesson = await prisma.completedLesson.create({ data: { courseId, lessonId, username, createdAt } })
	const lessonComplete = await prisma.eventLog.create({
		data: {
			type: "LESSON_COMPLETE",
			courseId,
			resourceId: lessonId,
			username,
			createdAt,
			payload: {}
		}
	});

	createdAt = new Date(createdAt.getTime() + 60 * 1000);

	return createdAt
}

async function seedQuizEvents({ lessonId, courseId, createdAt, username, quiz }: {
	lessonId: string,
	courseId: string,
	createdAt: Date,
	entryId: string,
	username: string,
	quiz: any,
}) {

	await prisma.eventLog.create({
		data: {
			type: "LESSON_QUIZ_START",
			courseId,
			resourceId: lessonId,
			username,
			createdAt,
			payload: {}
		}
	});

	createdAt = new Date(createdAt.getTime() + 60 * 1000);


	await prisma.eventLog.create({
		data: {
			type: "LESSON_QUIZ_SUBMISSION",
			courseId,
			resourceId: lessonId,
			username,
			createdAt,
			payload: {
				questionId: quiz.questionId,
				totalQuestionPool: 1,
				questionPoolIndex: 0,
				type: quiz.type,
				hintsUsed: getRandomItemsFromArray(quiz.hints?.map((hint: {
					hintId: string
				}) => hint.hintId)) as InputJsonValue,
				attempts: getRandomNumber(1, 3),
				solved: true
			}
		}
	});

	createdAt = new Date(createdAt.getTime() + 60 * 1000);

	return createdAt;
}
