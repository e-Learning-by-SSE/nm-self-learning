import { PrismaClient } from "@prisma/client";
import {
	getRandomCreatedAt,
	getRandomElementFromArray,
	getRandomTimeIntervalInMs
} from "../../seed-functions";

const prisma = new PrismaClient();
const DEFAULT_SLUG = "the-beginners-guide-to-react";

// Reuse this function for generating random numbers within a range

export async function generateLearningDiaryDemoData() {
	console.log("\x1b[94m%s\x1b[0m", "Learning Diary Example:");

	try {
		// Ensure the student "Dumbledore" exists in the database
		const student = await prisma.student.findUnique({
			where: { username: "dumbledore" }
		});

		if (!student) {
			console.error('Student "Dumbledore" not found.');
			return;
		}

		// Query the first 10 courses (hard-coded)
		const courses = await prisma.course.findMany({
			take: 10
		});

		// Ensure courses array is populated correctly
		if (!courses || courses.length === 0) {
			console.error("No courses found.");
			return;
		}

		const technique1 = await prisma.learningTechnique.findFirst({
			where: { name: "Einschätzung der persönlichen Zufriedenheit mit dem Erreichten" }
		});
		const technique2 = await prisma.learningTechnique.findFirst({
			where: { name: "Arbeitskontrakt abschließen" }
		});

		if (!technique1 || !technique2) {
			console.error("Techniques Not Found");
			return;
		}

		// Create Learning Locations (hard-coded)
		console.log(" - %s\x1b[32m ✔\x1b[0m", "Learning Locations");
		const location1 = await prisma.learningLocation.create({
			data: {
				id: "location-library",
				name: "Library",
				iconURL:
					"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRulMHCJFMvJ0RzVR_gNwnZQoUDf2vCc7sdcw&s",
				defaultLocation: true,
				creatorName: student.username
			}
		});

		const location2 = await prisma.learningLocation.create({
			data: {
				id: "location-cafe",
				name: "Cafe",
				iconURL:
					"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAyTCpAxP0hsJJ1wR1ZqjENDDTmcJakYPe2A&s",
				defaultLocation: false,
				creatorName: student.username
			}
		});

		const location3 = await prisma.learningLocation.create({
			data: {
				id: "location-home",
				name: "Home",
				iconURL:
					"data:image/png;base64,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",
				defaultLocation: false,
				creatorName: student.username
			}
		});

		// Create Learning Diary Entries (hard-coded)
		console.log(" - %s\x1b[32m ✔\x1b[0m", "Learning Diary Entry");
		const diaryEntry1 = await prisma.learningDiaryPage.create({
			data: {
				id: "diary-entry-advanced-spells",
				studentName: student.username,
				courseSlug: getRandomElementFromArray(courses).slug || DEFAULT_SLUG,
				notes: "Studied advanced spells",
				totalDurationLearnedMs: getRandomTimeIntervalInMs(),
				distractionLevel: 2,
				effortLevel: 3,
				scope: 5,
				learningLocationId: location1.id,
				createdAt: new Date(new Date().setMinutes(new Date().getMinutes() - 30))
			}
		});

		const diaryEntry2 = await prisma.learningDiaryPage.create({
			data: {
				id: "diary-entry-basic-potions",
				studentName: student.username,
				courseSlug: getRandomElementFromArray(courses).slug || DEFAULT_SLUG,
				notes: "Studied basic potions",
				totalDurationLearnedMs: getRandomTimeIntervalInMs(),
				distractionLevel: 1,
				effortLevel: 4,
				scope: 6,
				learningLocationId: location2.id,
				createdAt: getRandomCreatedAt()
			}
		});

		const emptyDiaryEntry = await prisma.learningDiaryPage.create({
			data: {
				studentName: student.username,
				courseSlug: getRandomElementFromArray(courses).slug || DEFAULT_SLUG,
				notes: "",
				totalDurationLearnedMs: getRandomTimeIntervalInMs(),
				distractionLevel: 0,
				effortLevel: 0,
				scope: 5,
				learningLocationId: null,
				createdAt: getRandomCreatedAt()
			}
		});

		// Additional hard-coded entries
		console.log(" - %s\x1b[32m ✔\x1b[0m", "Additional Learning Diary Entries");
		const additionalEntry1 = await prisma.learningDiaryPage.create({
			data: {
				id: "entry3",
				studentName: student.username,
				courseSlug: getRandomElementFromArray(courses).slug || DEFAULT_SLUG,
				notes: "Studied defensive spells",
				totalDurationLearnedMs: getRandomTimeIntervalInMs(),
				distractionLevel: 2,
				effortLevel: 3,
				scope: 4,
				learningLocationId: location3.id,
				createdAt: getRandomCreatedAt()
			}
		});

		const additionalEntry2 = await prisma.learningDiaryPage.create({
			data: {
				id: "entry4",
				studentName: student.username,
				courseSlug: getRandomElementFromArray(courses).slug || DEFAULT_SLUG,
				notes: "Studied magical creatures",
				totalDurationLearnedMs: getRandomTimeIntervalInMs(),
				distractionLevel: 1,
				effortLevel: 5,
				scope: 7,
				learningLocationId: location2.id,
				createdAt: getRandomCreatedAt()
			}
		});

		const additionalEntry3 = await prisma.learningDiaryPage.create({
			data: {
				id: "entry5",
				studentName: student.username,
				courseSlug: getRandomElementFromArray(courses).slug || DEFAULT_SLUG,
				notes: "Studied advanced charms",
				totalDurationLearnedMs: getRandomTimeIntervalInMs(),
				distractionLevel: 2,
				effortLevel: 4,
				scope: 6,
				learningLocationId: location1.id,
				createdAt: getRandomCreatedAt()
			}
		});

		const entryOverTwoDays = await prisma.learningDiaryPage.create({
			data: {
				id: "entry-over-two-days",
				studentName: student.username,
				courseSlug: getRandomElementFromArray(courses).slug || DEFAULT_SLUG,
				notes: "Studied transfiguration over two days",
				totalDurationLearnedMs: getRandomTimeIntervalInMs(),
				distractionLevel: 3,
				effortLevel: 4,
				scope: 8,
				learningLocationId: location3.id,
				createdAt: getRandomCreatedAt()
			}
		});

		// Create Learning Goals (hard-coded)
		console.log(" - %s\x1b[32m ✔\x1b[0m", "Learning Goals");
		const learningGoal1 = await prisma.learningGoal.create({
			data: {
				description: "Learn TypeScript",
				status: "ACTIVE",
				username: student.username,
				createdAt: new Date(),
				learningSubGoals: {
					create: [
						{
							description: "Understand basic types",
							status: "ACTIVE",
							createdAt: new Date()
						},
						{
							description: "Learn about interfaces",
							status: "INACTIVE",
							createdAt: new Date()
						}
					]
				}
			}
		});

		const learningGoal2 = await prisma.learningGoal.create({
			data: {
				description: "Master Prisma",
				status: "INACTIVE",
				username: student.username,
				createdAt: new Date(),
				learningSubGoals: {
					create: [
						{
							description: "Understand relations",
							status: "ACTIVE",
							createdAt: new Date()
						},
						{
							description: "Learn about migrations",
							status: "INACTIVE",
							createdAt: new Date()
						}
					]
				}
			}
		});

		const learningGoal3 = await prisma.learningGoal.create({
			data: {
				description: "Understand SQL",
				status: "INACTIVE",
				username: student.username,
				createdAt: new Date(),
				learningSubGoals: {
					create: [
						{
							description: "Learn basic SQL commands",
							status: "ACTIVE",
							createdAt: new Date()
						},
						{
							description: "Learn joins",
							status: "INACTIVE",
							createdAt: new Date()
						}
					]
				}
			}
		});

		const learningGoal4 = await prisma.learningGoal.create({
			data: {
				description: "Learn Docker",
				status: "ACTIVE",
				username: student.username,
				createdAt: new Date(),
				learningSubGoals: {
					create: [
						{
							description: "Understand containers",
							status: "ACTIVE",
							createdAt: new Date()
						},
						{
							description: "Learn Dockerfile basics",
							status: "INACTIVE",
							createdAt: new Date()
						}
					]
				}
			}
		});

		const learningGoal5 = await prisma.learningGoal.create({
			data: {
				description: "Learn Git and GitHub",
				status: "COMPLETED",
				username: student.username,
				createdAt: new Date(),
				learningSubGoals: {
					create: [
						{
							description: "Understand version control",
							status: "COMPLETED",
							createdAt: new Date()
						},
						{
							description: "Learn branching strategies",
							status: "COMPLETED",
							createdAt: new Date()
						}
					]
				}
			}
		});

		// Create Learning Technique Evaluations (hard-coded)
		console.log(" - %s\x1b[32m ✔\x1b[0m", "Learning Technique Evaluations");
		const evaluation1 = await prisma.techniqueRating.create({
			data: {
				score: 4,
				techniqueId: technique1.id,
				diaryPageId: diaryEntry1.id,
				creatorName: student.username
			}
		});

		const evaluation2 = await prisma.techniqueRating.create({
			data: {
				score: 2,
				techniqueId: technique2.id,
				diaryPageId: diaryEntry2.id,
				creatorName: student.username
			}
		});
	} catch (error) {
		console.error("Error generating demo data:", error);
	} finally {
		await prisma.$disconnect();
	}
}
