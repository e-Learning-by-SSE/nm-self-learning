/**
 * @jest-environment node
 */
import {
	CourseModel,
	EnrollmentStatus,
	LessonModel,
	QuizAttemptModel,
	StudentModel,
	UserModel
} from "@self-learning/database";
import { database } from "@self-learning/database/server";

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
	deleteCompletedLesson
} from "../helper";

let users: UserModel[];
let students: StudentModel[];
let course: CourseModel;
let lessons: LessonModel[];
let quizAttempt: QuizAttemptModel;
const dateNow = new Date();

describe("Hourly Average Quiz Answers for Student", () => {
	beforeAll(async () => {
		users = await createUsers(["student_avg_lesson_completion"]);

		students = await createStudents([users[0]]);

		course = await database.course.create({
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

		quizAttempt = await database.quizAttempt.create({
			data: {
				state: "COMPLETED",
				username: students[0].username,
				lessonId: lessons[0].lessonId
			}
		});

		await database.quizAnswer.create({
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
		// Clean up created data in reverse order
		await database.quizAnswer.deleteMany({
			where: { quizAttemptId: quizAttempt.attemptId }
		});
		await database.quizAttempt.deleteMany({
			where: { attemptId: quizAttempt.attemptId }
		});
		await deleteCompletedLesson(lessons[0]);
		await deleteStartedLesson(lessons[0]);
		await deleteLessons([lessons[0]]);
		await deleteEnrollments([course]);
		await database.course.deleteMany({
			where: { courseId: course.courseId }
		});
		await deleteStudents(students);
		await deleteUsers(users);

		await database.$disconnect();
	});

	it("should calculate 100% average lesson completion rate for student", async () => {
		const result = await database.studentMetric_HourlyAverageQuizAnswers.findFirst({
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
	});
});
