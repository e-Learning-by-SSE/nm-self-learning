import { PrismaClient } from "@prisma/client";
import eventLogsRaw from "./data/eventLogs.json";

const prisma = new PrismaClient();

export async function createEventLog() {
	console.log("\x1b[94m%s\x1b[0m", "Seeding Event Logs for Fundamentals of Wizardry...");

	try {
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
