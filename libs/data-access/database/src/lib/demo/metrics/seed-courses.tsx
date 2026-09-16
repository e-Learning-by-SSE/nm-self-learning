import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createCourses() {
	try {
		const courseData = [
			{
				courseId: "magical-test-course",
				slug: "fundamentals-of-wizardry",
				title: "Fundamentals of Wizardry",
				subtitle: "An Introduction to Magic and Spellcasting",
				content: [],
				meta: {},
				subjectId: "wizardry"
			},
			{
				courseId: "advanced-magical-theory",
				slug: "advanced-magical-theory",
				title: "Advanced Magical Theory",
				subtitle: "Exploring the Depths of Magic",
				content: [],
				meta: {},
				subjectId: "wizardry"
			},
			{
				courseId: "magical-creatures",
				slug: "magical-creatures",
				title: "Magical Creatures",
				subtitle: "Understanding the Beasts of the Wizarding World",
				content: [],
				meta: {},
				subjectId: "wizardry"
			},
			{
				courseId: "potions-and-elixirs",
				slug: "potions-and-elixirs",
				title: "Potions and Elixirs",
				subtitle: "The Art and Science of Potion Making",
				content: [],
				meta: {},
				subjectId: "wizardry"
			},
			{
				courseId: "defense-against-the-dark-arts",
				slug: "defense-against-the-dark-arts",
				title: "Defense Against the Dark Arts",
				subtitle: "Protecting Yourself from Dark Magic",
				content: [],
				meta: {},
				subjectId: "wizardry"
			}
		];

		await prisma.course.createMany({
			data: courseData
		});

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Courses");

		// Return array of courseIds or empty array if courseData is empty
		return Array.from(courseData, course => course.courseId);
	} catch (error) {
		console.error("Error creating courses:", error);
	} finally {
		await prisma.$disconnect();
	}
	return [];
}
