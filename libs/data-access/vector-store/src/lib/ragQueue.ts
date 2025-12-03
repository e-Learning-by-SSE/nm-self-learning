import { database } from "@self-learning/database";
import { startRagWorker } from "./ragWorker";

export async function getJobCount() {
	return await database.ragJob.count({
		where: { attempts: { lt: 3 } }
	});
}

export async function getRagJob(lessonId: string) {
	return await database.ragJob.findFirst({
		where: { lessonId, attempts: { lt: 3 } }
	});
}

export async function enqueueRagJob(lessonId: string, jobType: string) {
	await database.ragJob.create({
		data: {
			lessonId,
			status: "queued",
			attempts: 0,
			jobType: jobType
		}
	});
	startRagWorker();
}

export async function fetchNextRagJob() {
	return await database.ragJob.findFirst({
		where: { status: "queued" },
		orderBy: { createdAt: "asc" }
	});
}

export async function fetchRagJobs() {
	return await database.ragJob.findMany({
		where: { attempts: { lt: 3 } },
		orderBy: { createdAt: "asc" }
	});
}

export async function updateRagJobStatus(id: string, status: string) {
	await database.ragJob.update({
		where: { id },
		data: { status, updatedAt: new Date() }
	});
}

export async function incrementRagJobAttempts(id: string) {
	const job = await database.ragJob.findUnique({ where: { id } });
	if (job) {
		await database.ragJob.update({
			where: { id },
			data: { attempts: job.attempts + 1, updatedAt: new Date() }
		});
	}
}

export async function deleteRagJob(id: string) {
	await database.ragJob.delete({
		where: { id }
	});
}
