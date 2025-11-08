import {
	fetchNextRagJob,
	updateRagJobStatus,
	incrementRagJobAttempts,
	deleteRagJob
} from "./ragQueue";
import { trpc } from "@self-learning/api-client";

async function processRagJobs() {
	let running = true;
	const stop = () => {
		running = false;
	};
	process.on("SIGINT", stop);
	process.on("SIGTERM", stop);

	const ingestLesson = trpc.rag.ingestLesson.useMutation();

	while (running) {
		const job = await fetchNextRagJob();
		if (!job) {
			console.log("No RAG jobs in the queue. Waiting...");
			await new Promise(resolve => setTimeout(resolve, 50000));
			continue;
		}

		try {
			console.log(`Processing RAG job for lessonId: ${job.lessonId}`);
			// Placeholder for the actual RAG processing logic

			await updateRagJobStatus(job.id, "completed");
			console.log(`Completed RAG job for lessonId: ${job.lessonId}`);
			await deleteRagJob(job.id);
		} catch (error) {
			console.error(`Error processing RAG job for lessonId: ${job.lessonId}`, error);
			await incrementRagJobAttempts(job.id);
			await updateRagJobStatus(job.id, "failed");
		}
	}

	process.off("SIGINT", stop);
	process.off("SIGTERM", stop);
}

processRagJobs();
