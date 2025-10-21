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

		// 🧙‍♂️ Ensure the course exists (create only if missing)
		let course = await prisma.course.findUnique({
			where: { courseId: "magical-test-course" }
		});

		if (!course) {
			course = await prisma.course.create({
				data: {
					courseId: "magical-test-course",
					slug: "fundamentals-of-wizardry",
					title: "Fundamentals of Wizardry",
					subtitle: "An Introduction to Magic and Spellcasting",
					description:
						"This beginner-level course introduces aspiring witches and wizards to the foundations of magic, wand handling, potion brewing, and defense spells. Ideal for first-year students of Hogwarts or equivalent institutions.",
					imgUrl: null,
					content: [],
					meta: {},
					createdAt: new Date("2025-10-14T06:37:42.495Z"),
					updatedAt: new Date("2025-10-18T15:13:15.159Z"),
					subjectId: subject.subjectId
				}
			});
			console.log("✅ Course created:", course.title);
		} else {
			console.log("ℹ️ Course already exists, skipping creation.");
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
				courseId: course.courseId,
				type: "LESSON_VIDEO_START",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2h ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "video-1",
				courseId: course.courseId,
				type: "LESSON_VIDEO_END",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 1 + 1000 * 60 * 5), // 1h55 ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-1",
				courseId: course.courseId,
				type: "QUIZ_STARTED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 30), // 30 min ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-1",
				courseId: course.courseId,
				type: "QUIZ_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 25), // 25 min ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "lesson-end",
				courseId: course.courseId,
				type: "LESSON_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 5), // 5 min ago
				payload: {}
			},

			// --- Day 3 (yesterday) ---
			{
				username: "potter",
				resourceId: "video-2",
				courseId: course.courseId,
				type: "LESSON_VIDEO_START",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 90), // 1d 1.5h ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "video-2",
				courseId: course.courseId,
				type: "LESSON_VIDEO_END",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 60), // 1d 1h ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-2",
				courseId: course.courseId,
				type: "QUIZ_STARTED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 20), // 1d 20m ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-2",
				courseId: course.courseId,
				type: "QUIZ_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 10), // 1d 10m ago
				payload: {}
			},
			{
				username: "potter",
				resourceId: "lesson-end-2",
				courseId: course.courseId,
				type: "LESSON_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 5), // 1d 5m ago
				payload: {}
			},

			// --- Day 2 ---
			{
				username: "potter",
				resourceId: "video-3",
				courseId: course.courseId,
				type: "LESSON_VIDEO_START",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2 - 1000 * 60 * 90),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "video-3",
				courseId: course.courseId,
				type: "LESSON_VIDEO_END",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2 - 1000 * 60 * 60),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-3",
				courseId: course.courseId,
				type: "QUIZ_STARTED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2 - 1000 * 60 * 20),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-3",
				courseId: course.courseId,
				type: "QUIZ_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2 - 1000 * 60 * 10),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "lesson-end-3",
				courseId: course.courseId,
				type: "LESSON_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2 - 1000 * 60 * 5),
				payload: {}
			},

			// --- Day 1 ---
			{
				username: "potter",
				resourceId: "video-4",
				courseId: course.courseId,
				type: "LESSON_VIDEO_START",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 90),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "video-4",
				courseId: course.courseId,
				type: "LESSON_VIDEO_END",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 60),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-4",
				courseId: course.courseId,
				type: "QUIZ_STARTED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 20),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "quiz-4",
				courseId: course.courseId,
				type: "QUIZ_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 10),
				payload: {}
			},
			{
				username: "potter",
				resourceId: "lesson-end-4",
				courseId: course.courseId,
				type: "LESSON_COMPLETED",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 5),
				payload: {}
			}
		];

		await prisma.eventLog.createMany({
			data: eventLogsData,
			skipDuplicates: true
		});

		const enrollment = await prisma.enrollment.findUnique({
			where: {
				courseId_username: {
					courseId: course.courseId,
					username: "potter"
				}
			}
		});

		if (!enrollment) {
			await prisma.enrollment.create({
				data: {
					courseId: course.courseId,
					username: "potter",
					status: "COMPLETED",
					progress: 100,
					createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
					lastProgressUpdate: now,
					completedAt: now
				}
			});
			console.log("✅ Enrollment for Potter created.");
		} else {
			console.log("ℹ️ Enrollment for Potter already exists, skipping creation.");
		}

		console.log("✅ Event logs for Potter created successfully.");

		const weasleyEnrollment = await prisma.enrollment.findUnique({
			where: {
				courseId_username: {
					courseId: course.courseId,
					username: "weasley"
				}
			}
		});

		if (!weasleyEnrollment) {
			await prisma.enrollment.create({
				data: {
					courseId: course.courseId,
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
