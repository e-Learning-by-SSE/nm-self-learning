// Helper function to create students
import {
	AuthorModel,
	CourseModel,
	EnrollmentStatus,
	StudentModel,
	LessonModel,
	UserModel
} from "@self-learning/database";
import { database } from "@self-learning/database/server";
const prisma = database;

export async function createUsers(usernames: string[]) {
	const users: UserModel[] = [];

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

export async function deleteUsers(users: UserModel[]) {
	try {
		for (const user of users) {
			await prisma.user.deleteMany({
				where: { id: user.id }
			});
		}
	} catch (_error) {}
}

export async function createStudents(users: UserModel[]) {
	const students: StudentModel[] = [];

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

export async function deleteStudents(students: StudentModel[]) {
	for (const student of students) {
		await prisma.student.deleteMany({
			where: { userId: student.userId }
		});
	}
}

export async function createAuthors(users: UserModel[]) {
	const authors: AuthorModel[] = [];

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

export async function deleteAuthors(authors: AuthorModel[]) {
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

export async function deleteEnrollments(courses: CourseModel[]) {
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

export async function deleteLessons(lessons: LessonModel[]) {
	for (const lesson of lessons) {
		await prisma.lesson.deleteMany({
			where: { lessonId: lesson.lessonId }
		});
	}
}

export async function createStartedLesson(
	lesson: LessonModel,
	courseId: string,
	students: StudentModel[]
) {
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

export async function deleteStartedLesson(lesson: LessonModel) {
	await prisma.startedLesson.deleteMany({
		where: { lessonId: lesson.lessonId }
	});
}

export async function createCompletedLesson(
	lesson: LessonModel,
	courseId: string,
	students: StudentModel[]
) {
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

export async function deleteCompletedLesson(lesson: LessonModel) {
	await prisma.completedLesson.deleteMany({
		where: { lessonId: lesson.lessonId }
	});
}
