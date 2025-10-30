import {
	Author,
	Course,
	EnrollmentStatus,
	PrismaClient,
	Student,
	User,
	Lesson
} from "@prisma/client";
const prisma = new PrismaClient();

import {
	createStudents,
	deleteStudents,
	createEnrollments,
	deleteEnrollments,
	createAuthors,
	deleteAuthors,
	createUsers,
	deleteUsers,
	createLessons,
	deleteLessons,
	createStartedLesson,
	deleteStartedLesson,
	createCompletedLesson,
	deleteCompletedLesson
} from "../helper";

let users: User[];
let authors: Author[];
let students: Student[];
let course: Course;
let lessons: Lesson[];

// TEST SHOULD ONLY RUN IF DATABASE IS AVAILABLE

beforeAll(async () => {
	users = await createUsers([
		"author_avg_lesson_completion_by_course",
		"student_avg_lesson_completion_by_course-1",
		"student_avg_lesson_completion_by_course-2",
		"student_avg_lesson_completion_by_course-3",
		"student_avg_lesson_completion_by_course-4",
		"student_avg_lesson_completion_by_course-5",
		"student_avg_lesson_completion_by_course-6",
		"student_avg_lesson_completion_by_course-7",
		"student_avg_lesson_completion_by_course-8"
	]);

	authors = await createAuthors([users[0]]);

	students = await createStudents([
		users[1],
		users[2],
		users[3],
		users[4],
		users[5],
		users[6],
		users[7],
		users[8]
	]);

	course = await prisma.course.create({
		data: {
			courseId: "average-lesson-completion-rate-by-course-test-course",
			title: "Average Lesson Completion Rate by Course Test Course",
			slug: "average-lesson-completion-rate-by-course-test-course",
			subtitle: "A course to test average lesson completion rate by course metric",
			content: {},
			meta: {},
			authors: {
				// Id of the author needed and not the user id
				connect: { id: authors[0].id }
			}
		}
	});

	await createEnrollments([
		{
			courseId: course.courseId,
			// name of the student needed and not the user name
			username: students[0].username,
			status: EnrollmentStatus.COMPLETED
		},
		{
			courseId: course.courseId,
			username: students[1].username,
			status: EnrollmentStatus.COMPLETED
		},
		{
			courseId: course.courseId,
			username: students[2].username,
			status: EnrollmentStatus.COMPLETED
		},
		{
			courseId: course.courseId,
			username: students[3].username,
			status: EnrollmentStatus.COMPLETED
		},
		{
			courseId: course.courseId,
			username: students[4].username,
			status: EnrollmentStatus.COMPLETED
		},
		{
			courseId: course.courseId,
			username: students[5].username,
			status: EnrollmentStatus.COMPLETED
		},
		{
			courseId: course.courseId,
			username: students[6].username,
			status: EnrollmentStatus.COMPLETED
		},
		{
			courseId: course.courseId,
			username: students[7].username,
			status: EnrollmentStatus.COMPLETED
		}
	]);

	lessons = await createLessons(course.courseId, ["Lesson 1"]);

	await createStartedLesson(lessons[0], course.courseId, students);

	await createCompletedLesson(lessons[0], course.courseId, students);
});

afterAll(async () => {
	// Clean up created data in reverse order
	await deleteCompletedLesson(lessons[0]);

	await deleteStartedLesson(lessons[0]);

	await deleteLessons([lessons[0]]);

	await deleteEnrollments([course]);

	await prisma.course.deleteMany({
		where: { courseId: course.courseId }
	});

	await deleteAuthors(authors);

	await deleteStudents(students);

	await deleteUsers(users);

	await prisma.$disconnect();
});

test("should calculate 100% average lesson completion rate by course for author", async () => {
	const result = await prisma.authorMetric_AverageLessonCompletionRateByCourse.findUnique({
		where: { authorId: users[0].id }
	});

	console.log("Average Lesson Completion Rate Course Result:", result);

	expect(result).not.toBeNull();
	expect(result?.authorId).toBe(users[0].id);
	expect(result?.authorUsername).toBe(users[0].name);
	expect(result?.courseId).toBe(course.courseId);
	expect(result?.courseTitle).toBe(course.title);
	expect(result?.numLessons).toBe(1);
	expect(result?.totalLessonsStarted).toBe(8);
	expect(result?.totalLessonsFinished).toBe(8);
	expect(result?.averageCourseCompletionRate).toBe(100);
});
