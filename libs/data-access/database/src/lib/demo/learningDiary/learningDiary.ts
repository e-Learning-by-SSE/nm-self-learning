import { PrismaClient, LearningProgeres } from "@prisma/client";

const prisma = new PrismaClient();

function getRandomDuration() {
	const minDuration = 12 * 60 * 60 * 1000 + 5 * 60 * 1000; // 12 hours and 5 minutes in milliseconds
	const maxDuration = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
	return Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;
}

function generateRandomDate() {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
	return startDate;
}

function getRandomEffortLevel() {
	return Math.floor(Math.random() * 5) + 1;
}

function getRandomScope() {
	return Math.floor(Math.random() * 10) + 1;
}

export async function generateLearningDiaryDemoData() {
	console.log("\x1b[94m%s\x1b[0m", "Learning Diary" + " Example:");

	try {
		// Ensure the student "Dumbledore" exists in the database
		const student = await prisma.student.findUnique({
			where: { username: "dumbledore" }
		});

		if (!student) {
			console.error('Student "Dumbledore" not found.');
			return;
		}

		// Query the first 10 courses
		const courses = await prisma.course.findMany({
			take: 10
		});

		if (courses.length === 0) {
			console.error("No courses found.");
			return;
		}

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Semester");
		const semesterWinter2023 = await prisma.semester.create({
			data: {
				id: "semester-winter-2023",
				start: new Date("2023-10-01"),
				end: new Date("2024-03-31"),
				name: "Wintersemester 2023/24"
			}
		});

		const semesterSommer2024 = await prisma.semester.create({
			data: {
				id: "semester-sommer-2024",
				start: new Date("2024-04-01"),
				end: new Date("2024-09-30"),
				name: "Sommersemester 2024"
			}
		});

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
				iconURL: "https://example.com/icons/home.png",
				defaultLocation: false,
				creatorName: student.username
			}
		});

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Learning Strategies");
		const strategy1 = await prisma.learningStrategie.create({
			data: {
				id: "strategy-pomodoro",
				name: "Pomodoro Technique"
			}
		});

		const strategy2 = await prisma.learningStrategie.create({
			data: {
				id: "strategy-mindmapping",
				name: "Mind Mapping"
			}
		});

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Learning Techniques");
		const technique1 = await prisma.learningTechnique.create({
			data: {
				id: "technique-active-recall",
				name: "Active Recall",
				defaultTechnique: true,
				learningStrategieId: strategy1.id
			}
		});

		const technique2 = await prisma.learningTechnique.create({
			data: {
				id: "technique-spaced-repetition",
				name: "Spaced Repetition",
				creatorName: student.username,
				learningStrategieId: strategy2.id
			}
		});

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Learning Diary Entry");
		const diaryEntry = await prisma.learningDiaryEntry.create({
			data: {
				id: "diary-entry-advanced-spells",
				semesterId: semesterWinter2023.id,
				studentName: student.username,
				courseSlug: courses[0].slug, // Use the retrieved course slug
				notes: "Studied advanced spells",
				date: new Date(),
				start: new Date(),
				end: new Date(),
				distractionLevel: 2,
				effortLevel: getRandomEffortLevel(),
				scope: getRandomScope(),
				learningLocationId: location1.id
			}
		});

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Learning Technique Evaluations");
		const evaluation1 = await prisma.learningTechniqueEvaluation.create({
			data: {
				id: "evaluation1",
				score: 8,
				learningTechniqueId: technique1.id,
				learningDiaryEntryId: diaryEntry.id,
				creatorName: student.username
			}
		});

		const evaluation2 = await prisma.learningTechniqueEvaluation.create({
			data: {
				id: "evaluation2",
				score: 7,
				learningTechniqueId: technique2.id,
				learningDiaryEntryId: diaryEntry.id,
				creatorName: student.username
			}
		});

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Learning Goals");

		const goal1 = await prisma.learningGoal.create({
			data: {
				id: "goal1",
				name: "Goal 1",
				progress: LearningProgeres.NOT_STARTED,
				learningDiaryEntryId: diaryEntry.id
			}
		});

		const subGoal1 = await prisma.learningGoal.create({
			data: {
				id: "subgoal1",
				name: "Subgoal 1",
				progress: LearningProgeres.STARTED,
				learningDiaryEntryId: diaryEntry.id,
				parentGoalId: goal1.id
			}
		});

		const subGoal2 = await prisma.learningGoal.create({
			data: {
				id: "subgoal2",
				name: "Subgoal 2",
				progress: LearningProgeres.FINISHED,
				learningDiaryEntryId: diaryEntry.id,
				parentGoalId: goal1.id
			}
		});

		const goal2 = await prisma.learningGoal.create({
			data: {
				id: "goal2",
				name: "Goal 2",
				progress: LearningProgeres.NOT_STARTED,
				learningDiaryEntryId: diaryEntry.id
			}
		});

		const additionalEntries = [];

		for (let i = 1; i <= 10; i++) {
			const startDate = generateRandomDate();
			const duration = getRandomDuration();
			const endDate = new Date(startDate.getTime() + duration);

			additionalEntries.push({
				id: `entry${i}`,
				notes: `Entry ${i} notes`,
				date: startDate,
				start: startDate,
				end: endDate,
				courseSlug: courses[i % courses.length].slug,
				scope: getRandomScope()
			});
		}

		// Ensure at least one entry goes over two days
		const startDate = generateRandomDate();
		const endDate = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000 + 1); // 2 days and 1 millisecond
		additionalEntries[0] = {
			id: "entry-over-two-days",
			notes: "Entry over two days",
			date: startDate,
			start: startDate,
			end: endDate,
			courseSlug: courses[0].slug,
			scope: getRandomScope()
		};

		for (const entry of additionalEntries) {
			const createdEntry = await prisma.learningDiaryEntry.create({
				data: {
					id: entry.id,
					semesterId: semesterWinter2023.id,
					studentName: student.username,
					courseSlug: entry.courseSlug,
					notes: entry.notes,
					date: entry.date,
					start: entry.start,
					end: entry.end,
					distractionLevel: 2,
					effortLevel: getRandomEffortLevel(),
					scope: entry.scope,
					learningLocationId: location1.id
				}
			});

			// Ensure each diary entry has at least one learning technique evaluation
			await prisma.learningTechniqueEvaluation.create({
				data: {
					id: `evaluation-${entry.id}`,
					score: Math.floor(Math.random() * 10) + 1,
					learningTechniqueId: technique1.id,
					learningDiaryEntryId: createdEntry.id,
					creatorName: student.username
				}
			});
		}

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Additional Learning Diary Entries");
	} catch (error) {
		console.error("Error generating demo data:", error);
	} finally {
		await prisma.$disconnect();
	}
}
