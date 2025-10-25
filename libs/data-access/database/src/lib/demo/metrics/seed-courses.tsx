import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createCourses() {
	console.log("\x1b[94m%s\x1b[0m", "Creating courses...");

	try {
		await prisma.course.create({
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
				subjectId: "wizardry"
			}
		});

		await prisma.course.create({
			data: {
				courseId: "advanced-magical-theory",
				slug: "advanced-magical-theory",
				title: "Advanced Magical Theory",
				subtitle: "Exploring the Depths of Magic",
				description:
					"This advanced course delves into the intricate theories of magic, including advanced spellcasting techniques, magical creatures, and the history of magic. Suitable for experienced practitioners.",
				imgUrl: null,
				content: [],
				meta: {},
				subjectId: "wizardry"
			}
		});

		await prisma.course.create({
			data: {
				courseId: "magical-creatures",
				slug: "magical-creatures",
				title: "Magical Creatures",
				subtitle: "Understanding the Beasts of the Wizarding World",
				description:
					"This course provides an in-depth look at various magical creatures, their habitats, and their roles in the wizarding world. Students will learn about care, handling, and the ethical considerations of interacting with magical beings.",
				imgUrl: null,
				content: [],
				meta: {},
				subjectId: "wizardry"
			}
		});

		await prisma.course.create({
			data: {
				courseId: "potions-and-elixirs",
				slug: "potions-and-elixirs",
				title: "Potions and Elixirs",
				subtitle: "The Art and Science of Potion Making",
				description:
					"This practical course teaches the fundamentals of potion brewing, including ingredient selection, brewing techniques, and potion effects. Students will gain hands-on experience in creating various potions used in magical practices.",
				imgUrl: null,
				content: [],
				meta: {},
				subjectId: "wizardry"
			}
		});

		console.log("Courses successfully created.");
	} catch (error) {
		console.error("Error creating courses:", error);
	} finally {
		await prisma.$disconnect();
	}
}
