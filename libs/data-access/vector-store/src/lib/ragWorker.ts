import {
	updateRagJobStatus,
	incrementRagJobAttempts,
	deleteRagJob,
	fetchRagJobs
} from "./ragQueue";
// import { workerPoolManager } from "./workers/worker-pool-manager";

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
		// const ragPool = workerPoolManager.getRagProcessingPool();
		while (incrementer < jobs.length) {
			const job = jobs[incrementer];
			try {
				incrementer++;
				console.log(`[RAG Worker] Processing RAG job for lessonId: ${job.lessonId}`);
				// if (job.jobType === "embed") {
				// 	await ragPool.runTask({
				// 		type: "embedLesson",
				// 		payload: { lessonId: job.lessonId }
				// 	});
				// } else if (job.jobType === "delete") {
				// 	await ragPool.runTask({
				// 		type: "deleteEmbedding",
				// 		payload: { lessonId: job.lessonId }
				// 	});
				// }
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
