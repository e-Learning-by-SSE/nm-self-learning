import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createEventLog() {
	try {
		const courseIds = [
			"magical-test-course",
			"advanced-magical-theory",
			"magical-creatures",
			"potions-and-elixirs",
			"defense-against-the-dark-arts"
		];

		// InitialDate today - 6 weeks ago
		const initialDate = new Date(Date.now() - 6 * 7 * 24 * 60 * 60 * 1000);
		const eventLogs = [];

		for (let i = 0; i < 50; i++) {
			const date = new Date(initialDate.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 84); // Random date for the next 12 weeks
			date.setHours(Math.floor(Math.random() * 6) + 12, 0, 0, 0); // Set hours between 12 pm and 6 pm

			const dailyDate = new Date(date);
			const numLogs = Math.floor(Math.random() * 9) + 3; // create between 3 and 11 event logs per day
			const currentCourse = courseIds[Math.floor(Math.random() * courseIds.length)];
			eventLogs.push(
				...Array.from({ length: numLogs }).map(() => {
					// Every log is between 5 and 30 minutes later
					const increment = Math.floor(Math.random() * 26) + 5;
					dailyDate.setMinutes(dailyDate.getMinutes() + increment);
					// Store a clone of the Date so each log has its own timestamp
					return {
						createdAt: new Date(dailyDate.getTime()),
						username: "potter",
						type: "EVENT_TYPE_SAMPLE",
						courseId: currentCourse
					};
				})
			);
		}

		// Add specific logs for edge cases (Overlapping Hours)
		eventLogs.push(
			{
				createdAt: new Date(new Date().setHours(8, 45, 0, 0)),
				username: "luna",
				type: "EVENT_TYPE_SAMPLE",
				courseId: "magical-creatures"
			},
			{
				createdAt: new Date(new Date().setHours(9, 5, 0, 0)),
				username: "luna",
				type: "EVENT_TYPE_SAMPLE",
				courseId: "magical-creatures"
			}
		);

		// Add specific Logs for Non-Wizardry Courses and other Subjects
		const nonWizardCourseIds = (
			await prisma.course.findMany({
				where: {
					slug: {
						in: ["objectorientierte-programmierung-mit-java", "bewusstsein", "analysis"]
					}
				},
				select: { courseId: true }
			})
		).map(c => c.courseId);

		for (let i = 0; i < 10; i++) {
			const date = new Date(initialDate.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 84); // Random date for the next 12 weeks
			date.setHours(Math.floor(Math.random() * 6) + 12, 0, 0, 0); // Set hours between 12 pm and 6 pm

			const dailyDate = new Date(date);
			const numLogs = Math.floor(Math.random() * 9) + 3; // create between 3 and 11 event logs per day
			const currentCourse =
				nonWizardCourseIds[Math.floor(Math.random() * nonWizardCourseIds.length)];
			eventLogs.push(
				...Array.from({ length: numLogs }).map(() => {
					// Every log is between 5 and 30 minutes later
					const increment = Math.floor(Math.random() * 26) + 5;
					dailyDate.setMinutes(dailyDate.getMinutes() + increment);
					// Store a clone of the Date so each log has its own timestamp
					return {
						createdAt: new Date(dailyDate.getTime()),
						username: "potter",
						type: "EVENT_TYPE_SAMPLE",
						courseId: currentCourse
					};
				})
			);
		}

		await prisma.eventLog.createMany({ data: eventLogs });

		console.log(" - %s\x1b[32m ✔\x1b[0m", "Event Logs");
	} catch (error) {
		console.error("Error creating event logs:", error);
	} finally {
		await prisma.$disconnect();
	}
}
