import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed(): Promise<void> {
	await prisma.user.deleteMany();
	await prisma.course.deleteMany();
	await prisma.enrollments.deleteMany();

	await createUsers();
	await createCourses();
	await createEnrollments();

	console.log("🌱 Database has been seeded! 🌱");
}

seed()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

async function createEnrollments(): Promise<void> {
	const enrollments = [
		{
			status: "ACTIVE",
			createdAt: new Date(2022, 4, 20),
			courseId: "the-example-course",
			username: "potter"
		}
	];

	for (const enrollment of enrollments) {
		await prisma.enrollments.create({
			data: enrollment
		});
		console.log(`[Enrollment] created: ${enrollment.courseId}+${enrollment.username}`);
	}
}

async function createUsers(): Promise<void> {
	const users: Prisma.UserCreateInput[] = [
		{
			username: "potter",
			displayName: "Harry Potter"
		},
		{ username: "weasley", displayName: "Ronald Weasley" }
	];

	for (const user of users) {
		await prisma.user.create({
			data: user
		});
		console.log(`[User] created: ${user.username}`);
	}
}

async function createCourses(): Promise<void> {
	const courses = [
		{
			id: "the-example-course",
			slug: "the-example-course"
		}
	];

	for (const course of courses) {
		await prisma.course.create({
			data: course
		});
		console.log(`[Course] created: ${course.id}`);
	}
}
