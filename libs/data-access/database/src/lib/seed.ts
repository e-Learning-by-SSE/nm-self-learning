import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users: Prisma.UserCreateInput[] = [
	{
		username: "potter",
		displayName: "Harry Potter"
	},
	{ username: "weasley", displayName: "Ronald Weasley" }
];

const competences: Prisma.CompetenceCreateInput[] = [
	{ competenceId: "competence-1" },
	{ competenceId: "competence-2" },
	{ competenceId: "competence-3" }
];

async function seed(): Promise<void> {
	await prisma.user.deleteMany();
	await prisma.course.deleteMany();
	await prisma.enrollment.deleteMany();
	await prisma.competence.deleteMany();

	await createUsers();
	await createCourses();
	await createEnrollments();
	await createCompetences();
	await createAchievedCompetences();

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
		await prisma.enrollment.create({
			data: enrollment
		});
		console.log(`[Enrollment] created: ${enrollment.courseId}+${enrollment.username}`);
	}
}

async function createUsers(): Promise<void> {
	for (const user of users) {
		await prisma.user.create({
			data: user
		});
		console.log(`[User] created: ${user.username}`);
	}
}

async function createCourses(): Promise<void> {
	const courses: Prisma.CourseCreateInput[] = [
		{
			courseId: "the-example-course",
			slug: "the-example-course",
			title: "The Example Course",
			subtitle: "lorem ipsum...",
			imgUrl: null
		},
		{
			courseId: "the-second-course",
			slug: "the-second-course",
			title: "The Second Course",
			subtitle: "lorem ipsum...",
			imgUrl: null
		}
	];

	for (const course of courses) {
		await prisma.course.create({
			data: course
		});
		console.log(`[Course] created: ${course.courseId}`);
	}
}

async function createCompetences(): Promise<void> {
	console.log(competences);
	const promises = competences.map(({ competenceId }) =>
		prisma.competence.create({
			data: { competenceId }
		})
	);

	await Promise.all(promises);

	console.log(`[Competence]: created ${competences.length} entries`);
}

async function createAchievedCompetences(): Promise<void> {
	const achievedCompetences = [
		{
			username: users[0].username,
			competenceId: competences[0].competenceId
		},
		{
			username: users[0].username,
			competenceId: competences[1].competenceId
		}
	];

	const promises = achievedCompetences.map(({ competenceId, username }) =>
		prisma.achievedCompetence.create({
			data: {
				competenceId,
				username,
				lessonSlug: "a-beginners-guide-to-react-introduction",
				achievedAt: new Date(2022, 5, 20)
			}
		})
	);

	await Promise.all(promises);
	console.log(`[AchievedCompetence]: created ${achievedCompetences.length} entries`);
}
