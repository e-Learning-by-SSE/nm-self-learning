import {
	Course,
	EnrollmentStatus,
	PrismaClient,
	Student,
	User,
	Lesson,
	QuizAttempt
} from "@prisma/client";
const prisma = new PrismaClient();

import {
	createStudents,
	deleteStudents,
	createEnrollments,
	deleteEnrollments,
	createUsers,
	deleteUsers,
	createLessons,
	deleteLessons,
	createStartedLesson,
	deleteStartedLesson,
	createCompletedLesson,
	deleteCompletedLesson,
	getDemoDatabaseAvailability
} from "../helper";

let users: User[];
let students: Student[];
let course: Course;
let lessons: Lesson[];
let quizAttempt: QuizAttempt;
const dateNow = new Date();

// TEST SHOULD ONLY RUN IF DATABASE IS AVAILABLE
const isDatabaseAvailable = getDemoDatabaseAvailability();

beforeAll(async () => {
	if (!isDatabaseAvailable) {
		console.warn(
			"Skipping database tests: DATABASE_URL or demo instance flag not set correctly."
		);
		return;
	}

	users = await createUsers(["student_avg_lesson_completion"]);

	students = await createStudents([users[0]]);

	course = await prisma.course.create({
		data: {
			courseId: "average-lesson-completion-rate-test-course",
			title: "Average Lesson Completion Rate Test Course",
			slug: "average-lesson-completion-rate-test-course",
			subtitle: "A course to test average lesson completion rate metric",
			content: {},
			meta: {}
		}
	});

	await createEnrollments([
		{
			courseId: course.courseId,
			// name of the student needed and not the user name
			username: students[0].username,
			status: EnrollmentStatus.COMPLETED
		}
	]);

	lessons = await createLessons(course.courseId, ["Lesson 1"]);

	await createStartedLesson(lessons[0], course.courseId, students);

	await createCompletedLesson(lessons[0], course.courseId, students);

	quizAttempt = await prisma.quizAttempt.create({
		data: {
			state: "COMPLETED",
			username: students[0].username,
			lessonId: lessons[0].lessonId
		}
	});

	await prisma.quizAnswer.create({
		data: {
			quizAttemptId: quizAttempt.attemptId,
			questionId: "question-1",
			createdAt: dateNow,
			answer: {},
			isCorrect: true
		}
	});
});

afterAll(async () => {
	if (!isDatabaseAvailable) return;

	// Clean up created data in reverse order
	await prisma.quizAnswer.deleteMany({
		where: { quizAttemptId: quizAttempt.attemptId }
	});

	await prisma.quizAttempt.deleteMany({
		where: { attemptId: quizAttempt.attemptId }
	});

	await deleteCompletedLesson(lessons[0]);

	await deleteStartedLesson(lessons[0]);

	await deleteLessons([lessons[0]]);

	await deleteEnrollments([course]);

	await prisma.course.deleteMany({
		where: { courseId: course.courseId }
	});

	await deleteStudents(students);

	await deleteUsers(users);

	await prisma.$disconnect();
});

(isDatabaseAvailable ? test : test.skip)(
	"should calculate 100% average lesson completion rate for author",
	async () => {
		const result = await prisma.studentMetric_HourlyAverageQuizAnswers.findUnique({
			where: { userId: users[0].id }
		});

		console.log("Average Lesson Completion Rate Result:", result);

		expect(result).not.toBeNull();
		expect(result?.userId).toBe(users[0].id);
		expect(result?.username).toBe(users[0].name);
		expect(result?.courseId).toBe(course.courseId);
		expect(result?.courseTitle).toBe(course.title);
		expect(result?.lessonId).toBe(lessons[0].lessonId);
		expect(result?.lessonTitle).toBe(lessons[0].title);

		expect(result?.hour).toEqual(
			new Date(
				dateNow.getFullYear(),
				dateNow.getMonth(),
				dateNow.getDate(),
				dateNow.getHours()
			)
		);
		expect(result?.wrongAnswers).toBe(0);
		expect(result?.correctAnswers).toBe(1);
		expect(result?.averageAccuracyRate).toBe(100);
	}
);
