// Helper function to create students
import { Author, PrismaClient, Student, User, Course, Lesson } from "@prisma/client";
import { EnrollmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

export function getDemoDatabaseAvailability() {
	const DATABASE_URL_EXPECTED = "postgresql://username:password@dev-db:5432/SelfLearningDb";
	return (
		process.env.DATABASE_URL === DATABASE_URL_EXPECTED &&
		process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE === "true"
	);
}

export async function createUsers(usernames: string[]) {
	const users: User[] = [];

	for (const username of usernames) {
		users.push(
			await prisma.user.create({
				data: {
					name: username,
					displayName: username
				}
			})
		);
	}
	return users;
}

export async function deleteUsers(users: User[]) {
	for (const user of users) {
		await prisma.user.deleteMany({
			where: { id: user.id }
		});
	}
}

export async function createStudents(users: User[]) {
	const students: Student[] = [];

	for (const user of users) {
		students.push(
			await prisma.student.create({
				data: {
					userId: user.id,
					username: user.name ?? "No Username"
				}
			})
		);
	}
	return students;
}

export async function deleteStudents(students: Student[]) {
	for (const student of students) {
		await prisma.student.deleteMany({
			where: { userId: student.userId }
		});
	}
}

export async function createAuthors(users: User[]) {
	const authors: Author[] = [];

	for (const user of users) {
		authors.push(
			await prisma.author.create({
				data: {
					username: user.name ?? "No Username",
					displayName: user.name ?? "No Display Name",
					slug: `${user.name}-slug`
				}
			})
		);
	}
	return authors;
}

export async function deleteAuthors(authors: Author[]) {
	for (const author of authors) {
		await prisma.author.deleteMany({
			where: { id: author.id }
		});
	}
}

export async function createEnrollments(
	enrollments: { courseId: string; username: string; status: EnrollmentStatus }[]
) {
	for (const { courseId, username, status } of enrollments) {
		await prisma.enrollment.create({
			data: {
				courseId,
				username,
				status
			}
		});
	}
}

export async function deleteEnrollments(courses: Course[]) {
	for (const course of courses) {
		await prisma.enrollment.deleteMany({
			where: { courseId: course.courseId }
		});
	}
}

export async function createLessons(courseId: string, lessonTitles: string[]) {
	const lessons = [];
	for (const title of lessonTitles) {
		const lesson = await prisma.lesson.create({
			data: {
				lessonId: `${courseId}-${title.toLowerCase().replace(/\s+/g, "-")}`,
				slug: title.toLowerCase().replace(/\s+/g, "-"),
				title,
				content: {},
				meta: {}
			}
		});
		lessons.push(lesson);
	}
	return lessons;
}

export async function deleteLessons(lessons: Lesson[]) {
	for (const lesson of lessons) {
		await prisma.lesson.deleteMany({
			where: { lessonId: lesson.lessonId }
		});
	}
}

export async function createStartedLesson(lesson: Lesson, courseId: string, students: Student[]) {
	for (const student of students) {
		await prisma.startedLesson.create({
			data: {
				lessonId: lesson.lessonId,
				username: student.username,
				courseId: courseId
			}
		});
	}
}

export async function deleteStartedLesson(lesson: Lesson) {
	await prisma.startedLesson.deleteMany({
		where: { lessonId: lesson.lessonId }
	});
}

export async function createCompletedLesson(lesson: Lesson, courseId: string, students: Student[]) {
	for (const student of students) {
		await prisma.completedLesson.create({
			data: {
				lessonId: lesson.lessonId,
				username: student.username,
				courseId: courseId
			}
		});
	}
}

export async function deleteCompletedLesson(lesson: Lesson) {
	await prisma.completedLesson.deleteMany({
		where: { lessonId: lesson.lessonId }
	});
}
