import { LessonType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createLessonsForWizardry() {
	console.log("\x1b[94m%s\x1b[0m", "Creating lessons for magical-test-course...");

	try {
		const course = await prisma.course.findUnique({
			where: { courseId: "magical-test-course" }
		});

		if (!course) {
			console.error("Course 'magical-test-course' not found.");
			return;
		}

		const now = new Date();

		const lessonsData = [
			{
				lessonId: "lesson-1",
				slug: "introduction-to-wizardry",
				title: "Introduction to Wizardry",
				subtitle: "Getting started with magic",
				description: "An introductory lesson on the basics of wizardry.",
				imgUrl: "",
				content: {},
				quiz: {},
				meta: {},
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
				updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
				lessonType: LessonType.TRADITIONAL,
				licenseId: null,
				selfRegulatedQuestion: null
			},
			{
				lessonId: "lesson-2",
				slug: "basic-spells",
				title: "Basic Spells",
				subtitle: "Learn your first spells",
				description: "A lesson on casting basic spells for beginners.",
				imgUrl: "",
				content: {},
				quiz: {},
				meta: {},
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
				updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
				lessonType: LessonType.TRADITIONAL,
				licenseId: null,
				selfRegulatedQuestion: null
			},
			{
				lessonId: "lesson-3",
				slug: "wand-choosing",
				title: "Choosing Your Wand",
				subtitle: "Find the perfect wand for you",
				description: "A guide to selecting the right wand for your magical journey.",
				imgUrl: "",
				content: {},
				quiz: {},
				meta: {},
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
				updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
				lessonType: LessonType.TRADITIONAL,
				licenseId: null,
				selfRegulatedQuestion: null
			}
		];

		for (const lessonData of lessonsData) {
			await prisma.lesson.create({
				data: lessonData
			});
		}

		const completedLessonsData = [
			{
				courseId: "magical-test-course",
				lessonId: "lesson-1",
				username: "potter",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2)
			},
			{
				courseId: "magical-test-course",
				lessonId: "lesson-2",
				username: "potter",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2)
			},
			{
				courseId: "magical-test-course",
				lessonId: "lesson-1",
				username: "weasley",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2)
			}
		];

		for (const completedLessonData of completedLessonsData) {
			await prisma.completedLesson.create({
				data: completedLessonData
			});
		}

		console.log("🪄 Lessons successfully created for 'magical-test-course'.");
	} catch (error) {
		console.error("Error creating lessons:", error);
	} finally {
		await prisma.$disconnect();
	}
}
