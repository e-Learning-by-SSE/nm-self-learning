import { PrismaClient } from "@prisma/client";
import eventLogsRaw from "./data/eventLogs.json";

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

		const eventLogsData = eventLogsRaw.map(e => {
			const { timeOffsetMs, ...rest } = e; // exclude timeOffsetMs
			return {
				...rest,
				createdAt: new Date(now.getTime() + timeOffsetMs)
			};
		});

		await prisma.eventLog.createMany({
			data: eventLogsData,
			skipDuplicates: true
		});

		console.log("✅ Event logs for Weasley created successfully.");
	} catch (error) {
		console.error("❌ Error seeding event logs:", error);
	} finally {
		await prisma.$disconnect();
	}
}
