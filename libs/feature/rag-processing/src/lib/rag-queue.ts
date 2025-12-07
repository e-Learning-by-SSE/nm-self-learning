import { database } from "@self-learning/database";
import { workerPoolManager } from "@self-learning/api";

export async function getJobCount() {
	return await database.ragJob.count({
		where: { attempts: { lt: 3 } }
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
	processRagJobsWithWorkers().catch(console.error);
}

export async function fetchRagJobs() {
	return await database.ragJob.findMany({
		where: { attempts: { lt: 3 } },
		orderBy: { createdAt: "asc" },
		take: 10
	});
}

export async function updateJobStatus(id: string, status: string) {
	await database.ragJob.update({
		where: { id },
		data: {
			status,
			attempts: { increment: 1 },
			updatedAt: new Date()
		}
	});
}

export async function deleteRagJob(id: string) {
	await database.ragJob.delete({
		where: { id }
	});
}

/**
 * RAG Worker Processing Loop
 */

let isProcessing = false;

async function processRagJobsWithWorkers() {
	if (isProcessing) return;
	isProcessing = true;

	try {
		const pool = workerPoolManager.getRagProcessingPool();
		let jobs = await fetchRagJobs();

		while (jobs.length > 0) {
			const results = await Promise.allSettled(
				jobs.map(async job => {
					return await pool.runTask({
						type: "embedLesson",
						payload: {
							jobId: job.id,
							lessonId: job.lessonId
						}
					});
				})
			);

			const completedIds: string[] = [];
			const failedJobs: string[] = [];

			results.forEach((result, index) => {
				const jobId = jobs[index].id;
				if (result.status === "fulfilled") {
					completedIds.push(jobId);
				} else {
					failedJobs.push(jobId);
				}
			});

			await database.$transaction([
				...completedIds.map(id =>
					database.ragJob.delete({
						where: { id }
					})
				),
				...failedJobs.map(id =>
					database.ragJob.update({
						where: { id },
						data: {
							status: "failed",
							attempts: { increment: 1 },
							updatedAt: new Date()
						}
					})
				)
			]);
			jobs = await fetchRagJobs();
		}
	} catch (error) {
		console.error("RAG Worker Processing Error:", error);
	} finally {
		isProcessing = false;
	}
}
