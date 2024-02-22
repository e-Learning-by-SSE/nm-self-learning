import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

faker.seed(1);

const prisma = new PrismaClient();

const lASessions: Prisma.LASessionCreateManyInput[] = [];
const learningAnalytics: Prisma.LearningAnalyticsCreateManyInput[] = [];
for (let i = 0; i < 40; i++) {
	const start = new Date(
		new Date().valueOf() -
			1000 * 60 * 60 * 24 * i +
			(Math.floor(Math.random() * 23) + 1) * 1000 * 60 * 60
	);
	const end = new Date(start);
	end.setHours(end.getHours() + (Math.floor(Math.random() * 5) + 1));
	lASessions.push({
		id: i,
		start: start,
		end: end,
		username: "potter"
	});

	const mediaType = ["video", "article", "pdf", "iframe"];
	const videoSpeed = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

	const courses = [
		{
			id: "z97e0mlj",
			lessons: [
				"dej5nxdc",
				"dej5nxdc",
				"qirqw5xo",
				"u1rspwv0",
				"9889nrxg",
				"swz1nr14",
				"gvdbzl6y"
			]
		}
	];

	for (let j = 0; j < Math.floor(Math.random() * 6) + 2; j++) {
		const courseIndex = Math.floor(Math.random() * courses.length);
		learningAnalytics.push({
			sessionId: i,
			start: start,
			end: end,
			lessonId:
				courses[courseIndex].lessons[
					Math.floor(Math.random() * courses[courseIndex].lessons.length)
				],
			courseId: courses[courseIndex].id,
			preferredMediaType: mediaType[Math.floor(Math.random() * mediaType.length)],
			numberOfChangesMediaType: Math.floor(Math.random() * 10) + 1,
			videoStart: start,
			videoEnd: end,
			videoBreaks: Math.floor(Math.random() * 10) + 1,
			videoSpeed: videoSpeed[Math.floor(Math.random() * videoSpeed.length)],
			quizStart: start,
			quizEnd: end,
			numberCorrectAnswers: Math.floor(Math.random() * 10) + 1,
			numberIncorrectAnswers: Math.floor(Math.random() * 8) + 1,
			numberOfUsedHints: Math.floor(Math.random() * 5) + 1
		});
	}
}

export async function seedLearningAnalytics(): Promise<void> {
	console.log("\x1b[94m%s\x1b[0m", "Seeding Learning Analytics Data:");
	await prisma.lASession.createMany({ data: lASessions });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "LASessions");
	await prisma.learningAnalytics.createMany({ data: learningAnalytics });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Learning Analytics");
}
