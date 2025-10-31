import { Course, EnrollmentStatus, PrismaClient, Student, Subject, User } from "@prisma/client";
const prisma = new PrismaClient();

import {
	createStudents,
	deleteStudents,
	createEnrollments,
	deleteEnrollments,
	createUsers,
	deleteUsers
} from "../helper";

let users: User[];
let students: Student[];
let course: Course;
let subject: Subject;

// TEST SHOULD ONLY RUN IF DATABASE IS AVAILABLE

beforeAll(async () => {
	users = await createUsers(["student_avg_courses_completed_by_subject"]);

	students = await createStudents([users[0]]);

	course = await prisma.course.create({
		data: {
			courseId: "average-lesson-completion-rate-by-course-test-course",
			title: "Average Lesson Completion Rate by Course Test Course",
			slug: "average-lesson-completion-rate-by-course-test-course",
			subtitle: "A course to test average lesson completion rate by course metric",
			content: {},
			meta: {}
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

	await deleteStudents(students);

	await deleteUsers(users);

	await prisma.$disconnect();
});

test("should calculate 100% average courses completed by subject for student", async () => {
	const result = await prisma.studentMetric_CoursesCompletedBySubject.findUnique({
		where: { userId: users[0].id }
	});

	console.log("Average Courses Completed by Subject Result:", result);

	expect(result).not.toBeNull();
	expect(result?.userId).toBe(users[0].id);
	expect(result?.username).toBe(users[0].name);
	expect(result?.subjectId).toBe(subject.subjectId);
	expect(result?.subjectTitle).toBe(subject.title);
	expect(result?.completedCoursesCount).toBe(1);
	expect(result?.completedCourses).toEqual(course.title);
});
