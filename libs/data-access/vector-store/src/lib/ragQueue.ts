import { database } from "@self-learning/database";

export async function enqueueRagJob(lessonId: string) {
	await database.ragJob.create({
		data: {
			lessonId,
			status: "queued",
			attempts: 0
		}
	});
}

export async function fetchNextRagJob() {
	const job = await database.ragJob.findFirst({
		where: { status: "queued" },
		orderBy: { createdAt: "asc" }
	});
	return job;
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
