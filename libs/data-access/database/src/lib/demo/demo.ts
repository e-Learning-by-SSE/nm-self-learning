/* eslint-disable quotes */
import { PrismaClient } from "@prisma/client";
import { softwareentwicklungDemoSpecialization } from "../seedSpecializations";
import { demoSubjects } from "../seedSubjects";
import { generateEventlogDate } from "./event-log/seed-event-log";
import { seedEvents } from "./event-seed";
import { generateLearningDiaryDemoData } from "./learningDiary/learningDiary";
import { seedJavaDemo } from "./seed-java-demo";
import { seedReactDemo } from "./seed-react-demo";
import { seedSkillbasedModelling } from "./skill-based-modelling";
import { createQuizAttempts } from "./metrics/seed-quiz-attempt";
import { createQuizAnswers } from "./metrics/seed-quiz-answer";
import { createEventLog } from "./metrics/seed-event-log";
import { assignDumbledoreAsAuthor } from "./metrics/seed-author-course-relation";
import { create } from "domain";
import { createLessons } from "./metrics/seed-lessons";
import { createCompletedLessons } from "./metrics/seed-completedLessons";
import { createStartingLessons } from "./metrics/seed-startingLessons";
import { createUsers } from "./metrics/seed-users";
import { createStudents } from "./metrics/seed-students";
import { createEnrollments } from "./metrics/seed-enrollments";
import { createCourses } from "./metrics/seed-courses";
import { createSubjects } from "./metrics/seed-subject";

const prisma = new PrismaClient();

export async function seedDemos(): Promise<void> {
	console.log("\x1b[94m%s\x1b[0m", "Seeding Demo Data:");

	await prisma.subject.createMany({ data: demoSubjects });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Subjects");

	await prisma.specialization.createMany({ data: softwareentwicklungDemoSpecialization });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Specializations");

	await seedReactDemo();

	await seedJavaDemo();

	await seedEvents();

	await generateLearningDiaryDemoData();

	await generateEventlogDate();

	await seedSkillbasedModelling();

	// Seed event log data for the "Fundamentals of Wizardry" course

	await createEventLog();

	await createSubjects();

	await createCourses();

	await assignDumbledoreAsAuthor();

	await createUsers();

	await createStudents();

	await createEnrollments();

	await createLessons();

	await createCompletedLessons();

	await createStartingLessons();

	const quizAttempts = await createQuizAttempts();

	await createQuizAnswers(quizAttempts);
}
