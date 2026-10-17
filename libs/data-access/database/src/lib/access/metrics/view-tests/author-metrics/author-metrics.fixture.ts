import {
	Author,
	Course,
	EnrollmentStatus,
	Lesson,
	PrismaClient,
	Student,
	Subject,
	User
} from "@prisma/client";
import { randomUUID } from "node:crypto";

interface AuthorMetricFixtureOptions {
	name: string;
	studentCount: number;
	lessonCount?: number;
	withSubject?: boolean;
	withLessonActivity?: boolean;
}

export interface AuthorMetricFixture {
	authorUser: User;
	author: Author;
	studentUsers: User[];
	students: Student[];
	course: Course;
	lessons: Lesson[];
	subject: Subject | null;
	cleanup: () => Promise<void>;
}

export async function createAuthorMetricFixture(
	prisma: PrismaClient,
	options: AuthorMetricFixtureOptions
): Promise<AuthorMetricFixture> {
	const runId = randomUUID();
	const base = options.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
	const authorName = `${base}-author-${runId}`;
	const studentNames = Array.from(
		{ length: options.studentCount },
		(_, index) => `${base}-student-${index + 1}-${runId}`
	);
	const courseId = `${base}-course-${runId}`;
	const authorSlug = `${base}-author-${runId}`;
	const subjectId = `${base}-subject-${runId}`;
	const lessonIds = Array.from(
		{ length: options.lessonCount ?? 0 },
		(_, index) => `${courseId}-lesson-${index + 1}`
	);

	const cleanup = async () => {
		await prisma.completedLesson.deleteMany({
			where: { lessonId: { in: lessonIds } }
		});
		await prisma.startedLesson.deleteMany({
			where: { lessonId: { in: lessonIds } }
		});
		await prisma.lesson.deleteMany({ where: { lessonId: { in: lessonIds } } });
		await prisma.enrollment.deleteMany({ where: { courseId } });
		await prisma.subject.deleteMany({ where: { subjectId } });
		await prisma.course.deleteMany({ where: { courseId } });
		await prisma.author.deleteMany({ where: { slug: authorSlug } });
		await prisma.student.deleteMany({ where: { username: { in: studentNames } } });
		await prisma.user.deleteMany({ where: { name: { in: [authorName, ...studentNames] } } });
	};

	try {
		const authorUser = await prisma.user.create({
			data: { name: authorName, displayName: authorName }
		});
		const author = await prisma.author.create({
			data: {
				username: authorName,
				displayName: authorName,
				slug: authorSlug
			}
		});
		const studentUsers = await Promise.all(
			studentNames.map(name => prisma.user.create({ data: { name, displayName: name } }))
		);
		const students = await Promise.all(
			studentUsers.map((user, index) =>
				prisma.student.create({
					data: { userId: user.id, username: studentNames[index] }
				})
			)
		);

		const course = await prisma.course.create({
			data: {
				courseId,
				title: `${options.name} Test Course`,
				slug: courseId,
				subtitle: `Course fixture for ${options.name}`,
				content: {},
				meta: {},
				authors: { connect: { id: author.id } },
				version: 1,
				type: "STATIC"
			}
		});

		await prisma.enrollment.createMany({
			data: students.map(student => ({
				courseId,
				username: student.username,
				status: EnrollmentStatus.COMPLETED
			}))
		});

		const lessons = await Promise.all(
			lessonIds.map((lessonId, index) =>
				prisma.lesson.create({
					data: {
						lessonId,
						slug: lessonId,
						title: `Lesson ${index + 1}`,
						content: {},
						meta: {}
					}
				})
			)
		);

		if (options.withLessonActivity) {
			await prisma.startedLesson.createMany({
				data: lessons.flatMap(lesson =>
					students.map(student => ({
						lessonId: lesson.lessonId,
						username: student.username,
						courseId
					}))
				)
			});
			await prisma.completedLesson.createMany({
				data: lessons.flatMap(lesson =>
					students.map(student => ({
						lessonId: lesson.lessonId,
						username: student.username,
						courseId
					}))
				)
			});
		}

		const subject = options.withSubject
			? await prisma.subject.create({
					data: {
						subjectId,
						title: `${options.name} Test Subject`,
						slug: subjectId,
						subtitle: `Subject fixture for ${options.name}`,
						courses: { connect: { courseId } }
					}
				})
			: null;

		return { authorUser, author, studentUsers, students, course, lessons, subject, cleanup };
	} catch (error) {
		await cleanup();
		throw error;
	}
}
