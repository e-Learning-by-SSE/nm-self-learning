/* eslint-disable quotes */
import { PrismaClient } from "@prisma/client";
import { seedJavaDemo } from "./seed-java-demo";
import { license } from "../license";
import { softwareentwicklungDemoSpecialization } from "../seedSpecializations";
import { demoSubjects } from "../seedSubjects";
import { seedReactDemo } from "./seed-react-demo";

const prisma = new PrismaClient();

export async function seedDemos(): Promise<void> {
	console.log("\x1b[94m%s\x1b[0m", "Seeding Demo Data:");

	await prisma.license.createMany({ data: license });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Licenses");

	await prisma.subject.createMany({ data: demoSubjects });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Subjects");

	await prisma.specialization.createMany({ data: softwareentwicklungDemoSpecialization });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Specializations");

	await seedReactDemo();

	await seedJavaDemo();
}