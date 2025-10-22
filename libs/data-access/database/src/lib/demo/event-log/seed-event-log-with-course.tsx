import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedEventLogForWizardryCourse() {
	console.log("\x1b[94m%s\x1b[0m", "Seeding Event Logs for Fundamentals of Wizardry...");

	try {
		// 🧙‍♂️ Ensure the subject exists (create only if missing)

		let subject = await prisma.subject.findUnique({
			where: { subjectId: "wizardry" }
		});

		if (!subject) {
			subject = await prisma.subject.create({
				data: {
					subjectId: "wizardry",
					slug: "wizardry",
					title: "Wizardry",
					subtitle: "Fundamentals of Magical Arts and Spellcasting",
					imgUrlBanner:
						"https://c.pxhere.com/photos/1c/6b/magic_wizard_hat_wand_spellbook_potions_alchemy_mystic_fantasy-1582034.jpg!d",
					cardImgUrl:
						"https://c.pxhere.com/photos/1c/6b/magic_wizard_hat_wand_spellbook_potions_alchemy_mystic_fantasy-1582034.jpg!d"
				}
			});
			console.log("✅ Subject created:", subject.title);
		} else {
			console.log("ℹ️ Subject already exists, skipping creation.");
		}

		// 🧙‍♂️ Create multiple wizardry courses
		const coursesData = [
			{
				courseId: "magical-test-course",
				slug: "fundamentals-of-wizardry",
				title: "Fundamentals of Wizardry",
				subtitle: "An Introduction to Magic and Spellcasting",
				description:
					"This beginner-level course introduces aspiring witches and wizards to the foundations of magic, wand handling, potion brewing, and defense spells. Ideal for first-year students of Hogwarts or equivalent institutions.",
				createdAt: new Date("2025-10-14T06:37:42.495Z"),
				updatedAt: new Date("2025-10-18T15:13:15.159Z")
			},
			{
				courseId: "advanced-potion-brewing",
				slug: "advanced-potion-brewing",
				title: "Advanced Potion Brewing",
				subtitle: "Mastery of Elixirs and Draughts",
				description:
					"Learn the complex art of potion making, from the Draught of Living Death to Polyjuice Potion. This advanced course explores precise brewing techniques and rare ingredients used by master potion makers.",
				createdAt: new Date("2025-10-15T10:20:00.000Z"),
				updatedAt: new Date("2025-10-18T15:15:00.000Z")
			},
			{
				courseId: "defense-against-dark-arts",
				slug: "defense-against-dark-arts",
				title: "Defense Against the Dark Arts",
				subtitle: "Protection Spells and Curses",
				description:
					"Equip yourself with essential defensive spells to ward off curses, hexes, and dark creatures. Learn practical combat techniques and protective enchantments under expert guidance.",
				createdAt: new Date("2025-10-16T08:45:00.000Z"),
				updatedAt: new Date("2025-10-18T15:16:00.000Z")
			},
			{
				courseId: "history-of-magic",
				slug: "history-of-magic",
				title: "History of Magic",
				subtitle: "From Merlin to Modern Wizardry",
				description:
					"Explore the fascinating history of the magical world, from ancient enchantments to the rise of the modern Ministry of Magic. Includes rare accounts of wizarding duels and the evolution of spellcraft.",
				createdAt: new Date("2025-10-17T09:30:00.000Z"),
				updatedAt: new Date("2025-10-18T15:17:00.000Z")
			}
		];

		for (const courseData of coursesData) {
			let course = await prisma.course.findUnique({
				where: { courseId: courseData.courseId }
			});

			if (!course) {
				course = await prisma.course.create({
					data: {
						...courseData,
						imgUrl: null,
						content: [],
						meta: {},
						subjectId: subject.subjectId
					}
				});
				console.log(`✅ Course created: ${course.title}`);
			} else {
				console.log(`ℹ️ Course already exists: ${course.title}`);
			}
		}

		// 🧑‍🎓 Ensure Potter exists
		const student = await prisma.student.findUnique({
			where: { username: "potter" }
		});

		if (!student) {
			console.error("❌ Student 'potter' not found. Please seed user/student first.");
			return;
		}

		// 📜 Create example event logs
		const now = new Date();

		const eventLogsData = [
			// --- Day 4 (today) ---
			{
				username: "potter",
				resourceId: "video-1",
				courseId: coursesData[0].courseId,
				type: "LESSON_VIDEO_START",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2h ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "video-1",
				courseId: coursesData[0].courseId,
				type: "LESSON_VIDEO_END",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 1 + 1000 * 60 * 5), // 1h55 ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-1",
				courseId: coursesData[0].courseId,
				type: "QUIZ_STARTED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 30), // 30 min ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-1",
				courseId: coursesData[0].courseId,
				type: "QUIZ_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 25), // 25 min ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "lesson-end",
				courseId: coursesData[0].courseId,
				type: "LESSON_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 5), // 5 min ago
				payload: {}
			},

			// --- Day 3 (yesterday) ---
			{
				username: "potter",
				resourceId: "video-2",
				courseId: coursesData[0].courseId,
				type: "LESSON_VIDEO_START",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 90), // 1d 1.5h ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "video-2",
				courseId: coursesData[0].courseId,
				type: "LESSON_VIDEO_END",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 60), // 1d 1h ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-2",
				courseId: coursesData[0].courseId,
				type: "QUIZ_STARTED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 20), // 1d 20m ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-2",
				courseId: coursesData[0].courseId,
				type: "QUIZ_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 10), // 1d 10m ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "lesson-end-2",
				courseId: coursesData[0].courseId,
				type: "LESSON_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 5), // 1d 5m ago
				payload: {}
			},

			// --- Day 2 ---
			{
				username: "potter",
				resourceId: "video-3",
				courseId: coursesData[0].courseId,
				type: "LESSON_VIDEO_START",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2 - 1000 * 60 * 90),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "video-3",
				courseId: coursesData[0].courseId,
				type: "LESSON_VIDEO_END",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2 - 1000 * 60 * 60),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-3",
				courseId: coursesData[0].courseId,
				type: "QUIZ_STARTED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2 - 1000 * 60 * 20),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-3",
				courseId: coursesData[0].courseId,
				type: "QUIZ_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2 - 1000 * 60 * 10),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "lesson-end-3",
				courseId: coursesData[0].courseId,
				type: "LESSON_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2 - 1000 * 60 * 5),
				payload: {}
			},

			// --- Day 1 ---
			{
				username: "potter",
				resourceId: "video-4",
				courseId: coursesData[0].courseId,
				type: "LESSON_VIDEO_START",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 90),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "video-4",
				courseId: coursesData[0].courseId,
				type: "LESSON_VIDEO_END",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 60),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-4",
				courseId: coursesData[0].courseId,
				type: "QUIZ_STARTED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 20),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-4",
				courseId: coursesData[0].courseId,
				type: "QUIZ_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 10),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "lesson-end-4",
				courseId: coursesData[0].courseId,
				type: "LESSON_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 5),
				payload: {}
			},
			// --- Course 2
			{
				username: "potter",
				resourceId: "video-1",
				courseId: coursesData[1].courseId,
				type: "LESSON_VIDEO_START",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "video-1",
				courseId: coursesData[1].courseId,
				type: "LESSON_VIDEO_END",
				createdAt: new Date(now.getTime() - 1000 * 60 * 55),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-1",
				courseId: coursesData[1].courseId,
				type: "QUIZ_STARTED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 40),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-1",
				courseId: coursesData[1].courseId,
				type: "QUIZ_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 30),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "lesson-end-1",
				courseId: coursesData[1].courseId,
				type: "LESSON_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 10),
				payload: {}
			},

			// --- Day 2 ---
			{
				username: "potter",
				resourceId: "video-2",
				courseId: coursesData[1].courseId,
				type: "LESSON_VIDEO_START",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 90),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "video-2",
				courseId: coursesData[1].courseId,
				type: "LESSON_VIDEO_END",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 60),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-2",
				courseId: coursesData[1].courseId,
				type: "QUIZ_STARTED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 20),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-2",
				courseId: coursesData[1].courseId,
				type: "QUIZ_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 10),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "lesson-end-2",
				courseId: coursesData[1].courseId,
				type: "LESSON_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 5),
				payload: {}
			},

			// --- Course 3
			{
				username: "potter",
				resourceId: "video-1",
				courseId: coursesData[2].courseId,
				type: "LESSON_VIDEO_START",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 3),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "video-1",
				courseId: coursesData[2].courseId,
				type: "LESSON_VIDEO_END",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2 + 1000 * 60 * 10),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-1",
				courseId: coursesData[2].courseId,
				type: "QUIZ_STARTED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 90),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-1",
				courseId: coursesData[2].courseId,
				type: "QUIZ_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "lesson-end",
				courseId: coursesData[2].courseId,
				type: "LESSON_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 40),
				payload: {}
			},

			// --- Course 4
			{
				username: "potter",
				resourceId: "video-1",
				courseId: coursesData[3].courseId,
				type: "LESSON_VIDEO_START",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 4),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "video-1",
				courseId: coursesData[3].courseId,
				type: "LESSON_VIDEO_END",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 3 + 1000 * 60 * 5),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-1",
				courseId: coursesData[3].courseId,
				type: "QUIZ_STARTED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 90),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-1",
				courseId: coursesData[3].courseId,
				type: "QUIZ_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 75),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "lesson-end",
				courseId: coursesData[3].courseId,
				type: "LESSON_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60),
				payload: {}
			}
		];

		await prisma.eventLog.createMany({
			data: eventLogsData,
			skipDuplicates: true
		});

		console.log("✅ Event logs for Potter created successfully.");

		// Course 1 — COMPLETED
		const enrollment1 = await prisma.enrollment.findUnique({
			where: {
				courseId_username: {
					courseId: coursesData[0].courseId,
					username: "potter"
				}
			}
		});
		if (!enrollment1) {
			await prisma.enrollment.create({
				data: {
					courseId: coursesData[0].courseId,
					username: "potter",
					status: "COMPLETED",
					progress: 100,
					createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
					lastProgressUpdate: now,
					completedAt: now
				}
			});
			console.log(
				`✅ Enrollment for Potter created in ${coursesData[0].courseId} (COMPLETED)`
			);
		} else {
			console.log(
				`ℹ️ Enrollment for Potter already exists in ${coursesData[0].courseId}, skipping creation.`
			);
		}

		// Course 2 — ACTIVE
		const enrollment2 = await prisma.enrollment.findUnique({
			where: {
				courseId_username: {
					courseId: coursesData[1].courseId,
					username: "potter"
				}
			}
		});
		if (!enrollment2) {
			await prisma.enrollment.create({
				data: {
					courseId: coursesData[1].courseId,
					username: "potter",
					status: "ACTIVE",
					progress: 60,
					createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
					lastProgressUpdate: now,
					completedAt: null
				}
			});
			console.log(`✅ Enrollment for Potter created in ${coursesData[1].courseId} (ACTIVE)`);
		} else {
			console.log(
				`ℹ️ Enrollment for Potter already exists in ${coursesData[1].courseId}, skipping creation.`
			);
		}

		// Course 3 — ACTIVE
		const enrollment3 = await prisma.enrollment.findUnique({
			where: {
				courseId_username: {
					courseId: coursesData[2].courseId,
					username: "potter"
				}
			}
		});
		if (!enrollment3) {
			await prisma.enrollment.create({
				data: {
					courseId: coursesData[2].courseId,
					username: "potter",
					status: "ACTIVE",
					progress: 60,
					createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
					lastProgressUpdate: now,
					completedAt: null
				}
			});
			console.log(`✅ Enrollment for Potter created in ${coursesData[2].courseId} (ACTIVE)`);
		} else {
			console.log(
				`ℹ️ Enrollment for Potter already exists in ${coursesData[2].courseId}, skipping creation.`
			);
		}

		// Course 4 — COMPLETED
		const enrollment4 = await prisma.enrollment.findUnique({
			where: {
				courseId_username: {
					courseId: coursesData[3].courseId,
					username: "potter"
				}
			}
		});
		if (!enrollment4) {
			await prisma.enrollment.create({
				data: {
					courseId: coursesData[3].courseId,
					username: "potter",
					status: "COMPLETED",
					progress: 100,
					createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
					lastProgressUpdate: now,
					completedAt: now
				}
			});
			console.log(
				`✅ Enrollment for Potter created in ${coursesData[3].courseId} (COMPLETED)`
			);
		} else {
			console.log(
				`ℹ️ Enrollment for Potter already exists in ${coursesData[3].courseId}, skipping creation.`
			);
		}

		console.log("✅ Enrollments for Potter (4 courses) created successfully.");

		const weasleyEnrollment = await prisma.enrollment.findUnique({
			where: {
				courseId_username: {
					courseId: coursesData[0].courseId,
					username: "weasley"
				}
			}
		});

		if (!weasleyEnrollment) {
			await prisma.enrollment.create({
				data: {
					courseId: coursesData[0].courseId,
					username: "weasley",
					status: "ACTIVE",
					progress: 45, // e.g., 45% progress
					createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
					lastProgressUpdate: now
				}
			});
			console.log("✅ Enrollment for Weasley created (ACTIVE).");
		} else {
			console.log("ℹ️ Enrollment for Weasley already exists, skipping creation.");
		}

		console.log("✅ Event logs for Weasley created successfully.");
	} catch (error) {
		console.error("❌ Error seeding event logs:", error);
	} finally {
		await prisma.$disconnect();
	}
}
