import { EnrollmentStatus, PrismaClient, UserRole } from "@prisma/client";
import { CourseContent, extractLessonIds } from "@self-learning/types";

const prisma = new PrismaClient();
const prefix = "analytics-test-";

type TestCourse = {
	courseId: string;
	title: string;
	slug: string;
	content: unknown;
	subject: { subjectId: string; title: string } | null;
};

function lessonIds(course: TestCourse) {
	return [...new Set(extractLessonIds(course.content as CourseContent))];
}

function partialLessonCount(course: TestCourse, ratio: number) {
	const count = lessonIds(course).length;
	if (count < 2) throw new Error(`Course '${course.title}' needs at least two lessons for partial progress.`);
	return Math.min(count - 1, Math.max(1, Math.round(count * ratio)));
}

function activityDate(daysAgo: number, hour: number, minute: number) {
	const date = new Date();
	date.setHours(hour, minute, 0, 0);
	date.setDate(date.getDate() - daysAgo);
	return date;
}

async function createUser({
	username,
	role = UserRole.USER,
	authorCourseIds = []
}: {
	username: string;
	role?: UserRole;
	authorCourseIds?: string[];
}) {
	return prisma.user.create({
		data: {
			name: username,
			displayName: username,
			role,
			registrationCompleted: true,
			accounts: {
				create: { provider: "demo", providerAccountId: username, type: "demo-account" }
			},
			student: { create: { username } },
			featureFlags: {
				create: { username, learningStatistics: true, learningDiary: false, experimental: false }
			},
			...(authorCourseIds.length > 0 && {
				author: {
					create: {
						displayName: username,
						slug: username,
						courses: { connect: authorCourseIds.map(courseId => ({ courseId })) }
					}
				}
			})
		}
	});
}

async function enroll(username: string, course: TestCourse, completedLessonCount: number) {
	const ids = lessonIds(course);
	const completedIds = ids.slice(0, Math.min(completedLessonCount, ids.length));
	const progress = Math.floor((completedIds.length / ids.length) * 100);
	const completed = progress === 100;
	const now = new Date();

	await prisma.enrollment.create({
		data: {
			username,
			courseId: course.courseId,
			status: completed ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE,
			progress,
			lastProgressUpdate: now,
			completedAt: completed ? now : null
		}
	});

	if (completedIds.length > 0) {
		await prisma.startedLesson.createMany({
			data: completedIds.map(lessonId => ({ username, courseId: course.courseId, lessonId }))
		});
		await prisma.completedLesson.createMany({
			data: completedIds.map(lessonId => ({
				username,
				courseId: course.courseId,
				lessonId,
				performanceScore: 1
			}))
		});
	}

	return { progress, lessonCount: ids.length, completedLessonCount: completedIds.length };
}

async function startEveryLesson(username: string, courses: TestCourse[]) {
	await prisma.startedLesson.createMany({
		data: courses.flatMap(course =>
			lessonIds(course).map(lessonId => ({ username, courseId: course.courseId, lessonId }))
		)
	});
}

async function createLearningSession({
	username,
	course,
	lessonId,
	start,
	end
}: {
	username: string;
	course: TestCourse;
	lessonId: string;
	start: Date;
	end: Date;
}) {
	const lessonAttemptId = `${username}-${course.courseId}-${start.getTime()}`;

	await prisma.eventLog.createMany({
		data: [
			{
				username,
				courseId: course.courseId,
				resourceId: lessonId,
				type: "LESSON_OPEN",
				payload: { lessonAttemptId },
				createdAt: start
			},
			{
				username,
				courseId: course.courseId,
				resourceId: lessonId,
				type: "LESSON_EXIT",
				payload: { lessonAttemptId },
				createdAt: end
			}
		]
	});
}

async function main() {
	if (process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE !== "true") {
		throw new Error("This fixture requires NEXT_PUBLIC_IS_DEMO_INSTANCE=true for username-only login.");
	}

	// EventLog stores usernames without a foreign-key relation to User, so it is
	// not removed by cascading user deletion. Clear it explicitly before
	// recreating fixtures with the same usernames.
	await prisma.eventLog.deleteMany({ where: { username: { startsWith: prefix } } });
	await prisma.user.deleteMany({ where: { name: { startsWith: prefix } } });

	const candidates = (await prisma.course.findMany({
		where: { subjectId: { not: null } },
		include: { subject: { select: { subjectId: true, title: true } } },
		orderBy: [{ subjectId: "asc" }, { title: "asc" }]
	})) as TestCourse[];

	const courses = candidates.filter(course => lessonIds(course).length > 0);
	const primary = courses.find(course => course.slug === "didaktik-der-geometrie") ?? courses[0];
	if (!primary?.subject) throw new Error("No seeded course with lessons and a subject was found.");

	const secondary = courses.find(
		course =>
			course.courseId !== primary.courseId &&
			course.subject?.subjectId === primary.subject?.subjectId
	);
	if (!secondary) {
		throw new Error(`A second course with lessons is required in subject '${primary.subject.title}' for the 50% case.`);
	}

	const differentSubject = courses.find(
		course =>
			lessonIds(course).length >= 2 && course.subject?.subjectId !== primary.subject?.subjectId
	);
	if (!differentSubject?.subject) {
		throw new Error("A course with at least two lessons from a different subject is required.");
	}

	const zero = `${prefix}student-zero`;
	await createUser({ username: zero });
	await enroll(zero, primary, 0);
	await enroll(zero, differentSubject, 0);

	const partial = `${prefix}student-partial`;
	await createUser({ username: partial });
	const primaryPartial = await enroll(partial, primary, partialLessonCount(primary, 0.5));
	const otherPartial = await enroll(
		partial,
		differentSubject,
		partialLessonCount(differentSubject, 0.25)
	);

	const complete = `${prefix}student-complete`;
	await createUser({ username: complete });
	await enroll(complete, primary, lessonIds(primary).length);
	await enroll(complete, differentSubject, lessonIds(differentSubject).length);

	const half = `${prefix}student-half`;
	await createUser({ username: half });
	await enroll(half, primary, lessonIds(primary).length);
	await enroll(half, secondary, 0);
	const halfOther = await enroll(
		half,
		differentSubject,
		partialLessonCount(differentSubject, 0.5)
	);

	const activityUser = `${prefix}student-activity`;
	const activityUserRecord = await createUser({ username: activityUser });
	await enroll(activityUser, primary, 1);
	await enroll(activityUser, differentSubject, 1);

	const primaryLessonId = lessonIds(primary)[0];
	const differentSubjectLessonId = lessonIds(differentSubject)[0];

	await createLearningSession({
		username: activityUser,
		course: primary,
		lessonId: primaryLessonId,
		start: activityDate(2, 12, 0),
		end: activityDate(2, 12, 10)
	});
	await createLearningSession({
		username: activityUser,
		course: primary,
		lessonId: primaryLessonId,
		start: activityDate(1, 12, 0),
		end: activityDate(1, 12, 15)
	});
	await createLearningSession({
		username: activityUser,
		course: differentSubject,
		lessonId: differentSubjectLessonId,
		start: activityDate(0, 12, 0),
		end: activityDate(0, 12, 20)
	});
	await createLearningSession({
		username: activityUser,
		course: primary,
		lessonId: primaryLessonId,
		start: activityDate(0, 13, 0),
		end: activityDate(0, 13, 10)
	});

	const quizAttempt = await prisma.quizAttempt.create({
		data: {
			username: activityUser,
			lessonId: differentSubjectLessonId,
			state: "COMPLETED"
		}
	});
	await prisma.quizAnswer.createMany({
		data: [
			{
				quizAttemptId: quizAttempt.attemptId,
				questionId: "analytics-question-1",
				answer: { selected: 1 },
				isCorrect: true,
				createdAt: activityDate(0, 13, 5)
			},
			{
				quizAttemptId: quizAttempt.attemptId,
				questionId: "analytics-question-2",
				answer: { selected: 1 },
				isCorrect: true,
				createdAt: activityDate(0, 13, 6)
			},
			{
				quizAttemptId: quizAttempt.attemptId,
				questionId: "analytics-question-3",
				answer: { selected: 1 },
				isCorrect: true,
				createdAt: activityDate(0, 13, 7)
			},
			{
				quizAttemptId: quizAttempt.attemptId,
				questionId: "analytics-question-4",
				answer: { selected: 1 },
				isCorrect: false,
				createdAt: activityDate(0, 13, 8)
			}
		]
	});

	const teacher = `${prefix}teacher`;
	const authoredCourseIds = [primary.courseId, secondary.courseId, differentSubject.courseId];
	await createUser({ username: teacher, authorCourseIds: authoredCourseIds });

	const enrolledTeacher = `${prefix}teacher-enrolled`;
	await createUser({ username: enrolledTeacher, authorCourseIds: authoredCourseIds });
	await enroll(enrolledTeacher, secondary, 0);
	await enroll(
		enrolledTeacher,
		differentSubject,
		partialLessonCount(differentSubject, 0.25)
	);

	const admin = `${prefix}admin`;
	await createUser({ username: admin, role: UserRole.ADMIN, authorCourseIds: authoredCourseIds });

	// Eight learners ensure lesson-level author metrics pass the >= 7 privacy threshold.
	// All eight start every lesson. Completion distributions intentionally differ by course.
	const cohortCourses = [primary, secondary, differentSubject];
	for (let index = 0; index < 8; index++) {
		const username = `${prefix}cohort-${String(index + 1).padStart(2, "0")}`;
		await createUser({ username });
		await startEveryLesson(username, cohortCourses);

		// Primary: 7/8 finish the course. The eighth finishes one lesson.
		await enroll(username, primary, index < 7 ? lessonIds(primary).length : 1);
		// Same-subject secondary may contain only one lesson, so 7/8 finish it and one stays at 0%.
		// This still satisfies the >= 7 lesson-level analytics threshold.
		await enroll(username, secondary, index < 7 ? lessonIds(secondary).length : 0);
		// Different subject: 2/8 finish. Others finish one lesson.
		await enroll(
			username,
			differentSubject,
			index < 2 ? lessonIds(differentSubject).length : 1
		);
	}

	console.table([
		{
			username: zero,
			expected: `${primary.subject.title}: 0% (0/1); ${differentSubject.subject.title}: 0% (0/1)`
		},
		{
			username: partial,
			expected: `${primary.subject.title}: ${primaryPartial.progress}% (0/1); ${differentSubject.subject.title}: ${otherPartial.progress}% (0/1)`
		},
		{
			username: complete,
			expected: `${primary.subject.title}: 100% (1/1); ${differentSubject.subject.title}: 100% (1/1)`
		},
		{
			username: half,
			expected: `${primary.subject.title}: 50% (1/2); ${differentSubject.subject.title}: ${halfOther.progress}% (0/1)`
		},
		{
			username: activityUser,
			expected: "55 learning minutes; 3-day streak; 4 quiz answers; 75% accuracy"
		},
		{
			username: teacher,
			expected: `Creator analytics for ${primary.title}, ${secondary.title}, and ${differentSubject.title}`
		},
		{
			username: enrolledTeacher,
			expected: `Two tabs; learner view has ${primary.subject.title} and ${differentSubject.subject.title}`
		},
		{ username: admin, expected: "Administrator/creator analytics" }
	]);

	console.log("\nCreator analytics generated for analytics-test-teacher:");
	console.table(
		await prisma.authorMetric_AverageCourseCompletionRate.findMany({
			where: { authorUsername: teacher },
			select: {
				courseTitle: true,
				totalEnrollments: true,
				completedEnrollments: true,
				averageCompletionRate: true
			}
		})
	);
	console.table(
		await prisma.authorMetric_AverageLessonCompletionRateByCourse.findMany({
			where: { authorUsername: teacher },
			select: {
				courseTitle: true,
				numLessons: true,
				totalLessonsStarted: true,
				totalLessonsFinished: true,
				averageCourseCompletionRate: true
			}
		})
	);

	console.log("\nActivity analytics generated for analytics-test-student-activity:");
	console.log(
		await prisma.studentMetric_LearningTime.findUnique({
			where: { userId: activityUserRecord.id }
		})
	);
	console.table(
		await prisma.studentMetric_LearningTimeByCourse.findMany({
			where: { userId: activityUserRecord.id }
		})
	);
	console.table(
		await prisma.studentMetric_DailyLearningTime.findMany({
			where: { userId: activityUserRecord.id }
		})
	);
	console.log(
		await prisma.studentMetric_LearningStreak.findUnique({
			where: { userId: activityUserRecord.id }
		})
	);
	console.table(
		await prisma.studentMetric_AverageQuizAnswers.findMany({
			where: { userId: activityUserRecord.id }
		})
	);

	console.log("Log in through Demo-Account using any username printed above; no password is required.");
}

main()
	.catch(error => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => prisma.$disconnect());
