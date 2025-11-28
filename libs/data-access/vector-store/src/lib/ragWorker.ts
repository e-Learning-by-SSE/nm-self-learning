import {
	fetchNextRagJob,
	updateRagJobStatus,
	incrementRagJobAttempts,
	deleteRagJob
} from "./ragQueue";
import { TRPCError } from "@trpc/server";
import { database } from "@self-learning/database";
import { lessonContentSchema } from "@self-learning/types";
import { ragRetriever } from "@self-learning/vector-store";

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
		while (isProcessing) {
			const job = await fetchNextRagJob();
			if (!job) break;

			try {
				console.log(`Processing RAG job for lessonId: ${job.lessonId}`);
				if (job.jobType === "embed") {
					await ingestCourse(job.lessonId);
				} else if (job.jobType === "delete") {
					await deleteEmbedding(job.lessonId);
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
	}
}

export async function ingestCourse(lessonId: string) {
	try {
		if (!lessonId) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "courseId, courseName, and files are required"
			});
		}
		const lesson = await database.lesson.findUniqueOrThrow({
			where: { lessonId },
			select: { title: true, content: true }
		});
		console.log(`📥 Ingesting lesson: ${lesson.title}`);

		if (!lesson.content) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Lesson content not found"
			});
		}

		// pdf content extraction
		const parsedContent = lessonContentSchema.array().parse(lesson.content);
		const pdfContent = parsedContent
			.filter(content => content.type === "pdf")
			.map(content => content.value.url);

		if (pdfContent.length === 0) {
			console.log("No PDF content found to ingest.");
		}

		// article content extraction
		const articleContent = parsedContent
			.filter(content => content.type === "article")
			.map(content => content.value.content);

		if (articleContent.length === 0) {
			console.log("No Article content found to ingest.");
		}

		// video transcript extraction
		// const videoTranscripts = parsedContent
		// 	.filter(content => content.type === "video")
		// 	.map(content => content.value.transcript)
		// 	.filter((transcript): transcript is string => typeof transcript === "string");

		// if (videoTranscripts.length === 0) {
		// 	console.log("No Video transcripts found to ingest.");
		// }

		const pdfResult = await ragRetriever.processPDFFromURL(lessonId, lesson.title, pdfContent);
		return pdfResult;
	} catch (error) {
		console.error("❌ Ingestion error:", error);
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to ingest course"
		});
	}
}

export async function deleteEmbedding(lessonId: string) {
	try {
		if (!lessonId) {
			return false;
		}
		const results = await ragRetriever.deletelesson(lessonId);
		return results;
	} catch (error) {
		console.error("❌ Delete error:", error);
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to Delete Lesson Embedding"
		});
	}
}
