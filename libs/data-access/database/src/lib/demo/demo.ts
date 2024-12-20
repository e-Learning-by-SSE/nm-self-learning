/* eslint-disable quotes */
import { PrismaClient } from "@prisma/client";
import { softwareentwicklungDemoSpecialization } from "../seedSpecializations";
import { demoSubjects } from "../seedSubjects";
import { generateEventlogDate } from "./event-log/seed-event-log";
import { seedEvents } from "./event-seed";
import { generateLearningDiaryDemoData } from "./learningDiary/learningDiary";
import { seedJavaDemo } from "./seed-java-demo";
import { seedReactDemo } from "./seed-react-demo";

const prisma = new PrismaClient();

export async function seedDemos(): Promise<void> {
	console.log("\x1b[94m%s\x1b[0m", "Seeding Demo Data:");

	await prisma.subject.createMany({ data: demoSubjects });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Subjects");

	await prisma.specialization.createMany({ data: softwareentwicklungDemoSpecialization });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Specializations");

	await seedReactDemo();

	await seedJavaDemo();

	await seedEvents();

	await generateLearningDiaryDemoData();

	await generateEventlogDate();
}
