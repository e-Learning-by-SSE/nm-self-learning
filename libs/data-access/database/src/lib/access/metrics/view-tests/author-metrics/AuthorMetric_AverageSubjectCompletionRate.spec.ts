import {
	Author,
	Course,
	EnrollmentStatus,
	PrismaClient,
	Student,
	Subject,
	User
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
	deleteUsers
} from "../helper";

let users: User[];
let authors: Author[];
let students: Student[];
let course: Course;
let subject: Subject;

// TEST SHOULD ONLY RUN IF DATABASE IS AVAILABLE

beforeAll(async () => {
	users = await createUsers([
		"author_avg_lesson_completion_by_course",
		"student_avg_lesson_completion_by_course-1"
	]);

	authors = await createAuthors([users[0]]);

	students = await createStudents([users[1]]);

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

	subject = await prisma.subject.create({
		data: {
			subjectId: "average-lesson-completion-rate-by-course-test-subject",
			title: "Average Lesson Completion Rate by Course Test Subject",
			slug: "average-lesson-completion-rate-by-course-test-subject",
			subtitle: "A subject to test average lesson completion rate by course metric",
			courses: {
				connect: { courseId: course.courseId }
			}
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
});

afterAll(async () => {
	// Clean up created data in reverse order
	await deleteEnrollments([course]);

	await prisma.subject.deleteMany({
		where: { subjectId: subject.subjectId }
	});

	await prisma.course.deleteMany({
		where: { courseId: course.courseId }
	});

	await deleteAuthors(authors);

	await deleteStudents(students);

	await deleteUsers(users);

	await prisma.$disconnect();
});

test("should calculate 100% average subject completion rate for author", async () => {
	const result = await prisma.authorMetric_AverageSubjectCompletionRate.findUnique({
		where: { authorId: users[0].id }
	});

	console.log("Average Subject Completion Rate Result:", result);

	expect(result).not.toBeNull();
	expect(result?.authorId).toBe(users[0].id);
	expect(result?.authorUsername).toBe(users[0].name);
	expect(result?.subjectId).toBe(subject.subjectId);
	expect(result?.subjectTitle).toBe(subject.title);
	expect(result?.totalEnrollments).toBe(1);
	expect(result?.completedEnrollments).toBe(1);
	expect(result?.averageCompletionRate).toBe(100);
});
