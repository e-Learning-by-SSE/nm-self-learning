/**
 * @jest-environment node
 */
import {
	AuthorModel,
	CourseModel,
	EnrollmentStatus,
	StudentModel,
	UserModel
} from "@self-learning/database";
import { database } from "@self-learning/database/server";

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

let users: UserModel[];
let authors: AuthorModel[];
let students: StudentModel[];
let course: CourseModel;

describe("Average Course Completion Rate", () => {
	beforeAll(async () => {
		users = await createUsers([
			"author_avg_course_completion",
			"student_avg_course_completion"
		]);

		authors = await createAuthors([users[0]]);

		students = await createStudents([users[1]]);

		course = await database.course.create({
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
		// Clean up created data in reverse order
		await deleteEnrollments([course]);
		await database.course.deleteMany({
			where: { courseId: course.courseId }
		});
		await deleteAuthors(authors);
		await deleteStudents(students);
		await deleteUsers(users);
		await database.$disconnect();
	});

	it("should calculate 100% average course completion rate for author", async () => {
		const result = await database.authorMetric_AverageCourseCompletionRate.findFirst({
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
	});
});
