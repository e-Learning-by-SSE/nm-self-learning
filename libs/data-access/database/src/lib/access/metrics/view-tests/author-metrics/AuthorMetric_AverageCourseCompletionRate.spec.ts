import { Author, Course, EnrollmentStatus, PrismaClient, Student, User } from "@prisma/client";
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
	getDemoDatabaseAvailability
} from "../helper";

let users: User[];
let authors: Author[];
let students: Student[];
let course: Course;

// TEST SHOULD ONLY RUN IF DATABASE IS AVAILABLE
const isDatabaseAvailable = getDemoDatabaseAvailability();

beforeAll(async () => {
	if (!isDatabaseAvailable) {
		console.warn(
			"Skipping database tests: DATABASE_URL or demo instance flag not set correctly."
		);
		return;
	}

	users = await createUsers(["author_avg_course_completion", "student_avg_course_completion"]);

	authors = await createAuthors([users[0]]);

	students = await createStudents([users[1]]);

	course = await prisma.course.create({
		data: {
			courseId: "average-course-completion-rate-test-course",
			title: "Average Course Completion Rate Test Course",
			slug: "average-course-completion-rate-test-course",
			subtitle: "A course to test average course completion rate metric",
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
		}
	]);
});

afterAll(async () => {
	if (!isDatabaseAvailable) return;

	// Clean up created data in reverse order
	await deleteEnrollments([course]);

	await prisma.course.deleteMany({
		where: { courseId: course.courseId }
	});

	await deleteAuthors(authors);

	await deleteStudents(students);

	await deleteUsers(users);

	await prisma.$disconnect();
});

(isDatabaseAvailable ? test : test.skip)(
	"should calculate 100% average course completion rate for author",
	async () => {
		const result = await prisma.authorMetric_AverageCourseCompletionRate.findUnique({
			where: { authorId: users[0].id }
		});

		console.log("Average Course Completion Rate Result:", result);

		expect(result).not.toBeNull();
		expect(result?.authorId).toBe(users[0].id);
		expect(result?.authorUsername).toBe(users[0].name);
		expect(result?.courseId).toBe(course.courseId);
		expect(result?.courseTitle).toBe(course.title);
		expect(result?.totalEnrollments).toBe(1);
		expect(result?.completedEnrollments).toBe(1);
		expect(result?.averageCompletionRate).toBe(100);
	}
);
