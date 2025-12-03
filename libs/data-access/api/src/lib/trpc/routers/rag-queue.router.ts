import { database } from "@self-learning/database";
import { t } from "../trpc";
import {
	EnqueueJobInputSchema,
	UpdateJobStatusInputSchema,
	JobIDInputSchema
} from "@self-learning/types";
import { workerPoolManager } from "@self-learning/api";

export const ragQueueRouter = t.router({
	getJobCount: t.procedure.query(async () => {
		return await getJobCount();
	}),
	enqueueRagJob: t.procedure.input(EnqueueJobInputSchema).mutation(async ({ input }) => {
		const { lessonId, jobType } = input;
		await enqueueRagJob(lessonId, jobType);
	}),
	fetchRagJobs: t.procedure.query(async () => {
		return await fetchRagJobs();
	}),
	updateRagJobStatus: t.procedure
		.input(UpdateJobStatusInputSchema)
		.mutation(async ({ input }) => {
			const { jobId, status } = input;
			await updateRagJobStatus(jobId, status);
		}),
	incrementRagJobAttempts: t.procedure.input(JobIDInputSchema).mutation(async ({ input }) => {
		await incrementRagJobAttempts(input.jobId);
	}),
	deleteRagJob: t.procedure.input(JobIDInputSchema).mutation(async ({ input }) => {
		await deleteRagJob(input.jobId);
	})
});

/**
 * RAG Jobs Queue Functions
 */

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

/**
 * RAG Worker Processing Loop
 */
let isProcessing = false;
export async function startRagWorker() {
	if (isProcessing) {
		console.log("RAG worker is already running.");
		return;
	}
	await processRagJobs();
}

async function processRagJobs() {
	try {
		isProcessing = true;
		let incrementer = 0;
		const jobs = await fetchRagJobs();
		const ragPool = workerPoolManager.getRagProcessingPool();
		while (incrementer < jobs.length) {
			const job = jobs[incrementer];
			try {
				incrementer++;
				console.log(`[RAG Worker] Processing RAG job for lessonId: ${job.lessonId}`);
				if (job.jobType === "embed") {
					await ragPool.runTask({
						type: "embedLesson",
						payload: { lessonId: job.lessonId }
					});
				} else if (job.jobType === "delete") {
					await ragPool.runTask({
						type: "deleteEmbedding",
						payload: { lessonId: job.lessonId }
					});
				}
				await updateRagJobStatus(job.id, "completed");
				console.log(`Completed RAG job for lessonId: ${job.lessonId}`);
				await deleteRagJob(job.id);
			} catch (error) {
				console.error(`Error processing RAG job for lessonId: ${job.lessonId}`, error);
				await incrementRagJobAttempts(job.id);
				await updateRagJobStatus(job.id, "failed");
			}
		}
	} finally {
		isProcessing = false;
		console.log("[RAG Worker] Processing loop ended");
	}
}
