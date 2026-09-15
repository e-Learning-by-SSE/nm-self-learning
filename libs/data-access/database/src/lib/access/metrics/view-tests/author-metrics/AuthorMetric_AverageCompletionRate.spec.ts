/**
 * @jest-environment node
 */
import { EnrollmentStatus } from "@self-learning/database";
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

let users: User[];
let authors: Author[];
let students: Student[];
let course: Course;

describe("Average Course Completion Rate", () => {
	beforeAll(async () => {
		users = await createUsers(["author_avg_completion", "student_avg_completion"]);
		authors = await createAuthors([users[0]]);
		students = await createStudents([users[1]]);

		course = await database.course.create({
			data: {
				courseId: "average-completion-rate-test-course",
				title: "Average Completion Rate Test Course",
				slug: "average-completion-rate-test-course",
				subtitle: "A course to test average completion rate metric",
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

	it("should calculate 100% average completion rate for author", async () => {
		const result = await database.authorMetric_AverageCompletionRate.findUnique({
			where: { authorId: users[0].id }
		});

		console.log("Average Completion Rate Result:", result);

		expect(result).not.toBeNull();
		expect(result?.authorId).toBe(users[0].id);
		expect(result?.authorUsername).toBe(users[0].name);
		expect(result?.averageCompletionRate).toBe(100);
	});
});
