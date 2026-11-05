import { createPrismaClient } from "../../prisma-client";
import { CourseType } from "../../../generated/prisma/client";
import { createCourseMeta, type CourseContent } from "@self-learning/types";
import lessonsRaw from "./data/lesson.json";

const prisma = createPrismaClient();

function getCourseContent(courseId: string, title: string) {
	const source = lessonsRaw.find(course => course.courseId === courseId);
	if (!source) throw new Error(`No lesson seed data found for course '${courseId}'.`);

	const content: CourseContent = [
		{ title, content: source.content.map(lesson => ({ lessonId: lesson.lessonId })) }
	];
	return { content, meta: createCourseMeta({ content }) };
}

export async function createCourses() {
	try {
		const courseData = [
			{
				courseId: "magical-test-course",
				slug: "fundamentals-of-wizardry",
				title: "Fundamentals of Wizardry",
				subtitle: "An Introduction to Magic and Spellcasting",
				...getCourseContent("magical-test-course", "Fundamentals of Wizardry"),
				subjectId: "wizardry",
				version: 1,
				type: CourseType.STATIC
			},
			{
				courseId: "advanced-magical-theory",
				slug: "advanced-magical-theory",
				title: "Advanced Magical Theory",
				subtitle: "Exploring the Depths of Magic",
				...getCourseContent("advanced-magical-theory", "Advanced Magical Theory"),
				subjectId: "wizardry",
				version: 1,
				type: CourseType.STATIC
			},
			{
				courseId: "magical-creatures",
				slug: "magical-creatures",
				title: "Magical Creatures",
				subtitle: "Understanding the Beasts of the Wizarding World",
				...getCourseContent("magical-creatures", "Magical Creatures"),
				subjectId: "wizardry",
				version: 1,
				type: CourseType.STATIC
			},
			{
				courseId: "potions-and-elixirs",
				slug: "potions-and-elixirs",
				title: "Potions and Elixirs",
				subtitle: "The Art and Science of Potion Making",
				...getCourseContent("potions-and-elixirs", "Potions and Elixirs"),
				subjectId: "wizardry",
				version: 1,
				type: CourseType.STATIC
			},
			{
				courseId: "defense-against-the-dark-arts",
				slug: "defense-against-the-dark-arts",
				title: "Defense Against the Dark Arts",
				subtitle: "Protecting Yourself from Dark Magic",
				...getCourseContent(
					"defense-against-the-dark-arts",
					"Defense Against the Dark Arts"
				),
				subjectId: "wizardry",
				version: 1,
				type: CourseType.STATIC
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
