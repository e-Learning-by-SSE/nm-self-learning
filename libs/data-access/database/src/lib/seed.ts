/* eslint-disable quotes */
import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { mathExample } from "./math/math-example";
import { psychologyExample } from "./psychology/psychology-example";
import { seedDemos } from "./demo/demo";
import { subjects } from "./seedSubjects";
import { specializations } from "./seedSpecializations";

const prisma = new PrismaClient();

async function seed(): Promise<void> {
	const start = Date.now();

	console.log("Deleting previous records...");
	await prisma.learningDiaryLearnedLessons.deleteMany();
	await prisma.studentSettings.deleteMany();
	await prisma.skillRepository.deleteMany();
	await prisma.user.deleteMany();
	await prisma.team.deleteMany();
	await prisma.course.deleteMany();
	await prisma.specialization.deleteMany();
	await prisma.subject.deleteMany();
	await prisma.enrollment.deleteMany();
	await prisma.lesson.deleteMany();
	await prisma.license.deleteMany();
	await prisma.skill.deleteMany();
	await prisma.learningGoal.deleteMany();
	await prisma.techniqueRating.deleteMany();
	await prisma.learningTechnique.deleteMany();
	await prisma.learningStrategy.deleteMany();
	await prisma.learningLocation.deleteMany();
	await prisma.learningDiaryPage.deleteMany();
	console.log("😅 Seeding...");

	if (process.env["NEXT_PUBLIC_IS_DEMO_INSTANCE"] === "true") {
		faker.seed(1);
		await seedDemos();
	}

	await prisma.subject.createMany({ data: subjects });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Subjects");

	await prisma.specialization.createMany({ data: specializations });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Specialities");

	await psychologyExample();

	await mathExample();

	console.log(`\nSeed command took ${Date.now() - start}ms`);
}

seed()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
