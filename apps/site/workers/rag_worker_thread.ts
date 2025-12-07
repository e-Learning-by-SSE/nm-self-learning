/* eslint-disable @typescript-eslint/no-explicit-any */
import "./polyfills.js";
import { parentPort } from "worker_threads";
import {
	ragProcessor,
	vectorStore,
	lessonContentSchema,
	embeddingService
} from "@self-learning/rag-processing/server";
import { PrismaClient } from "@prisma/client";

const database = new PrismaClient({
	log: ["error"],
	datasources: {
		db: {
			url: process.env.DATABASE_URL
		}
	}
});

if (!parentPort) {
	throw new Error("This script must be run as a worker thread.");
}

parentPort.on("message", async data => {
	try {
		console.log(`[RAG Worker] Received task: ${data.type}`);
		if (data.type === "embedLesson") {
			const { lessonId } = data.payload;

			const lesson = await database.lesson.findUniqueOrThrow({
				where: { lessonId },
				select: { title: true, content: true }
			});

			console.log(`[RAG Worker] Embedding lesson: ${lesson.title}`);

			if (!lesson.content) {
				throw new Error("Lesson content not found");
			}

			const parsedContent = lessonContentSchema.array().parse(lesson.content);

			const pdfUrls = parsedContent
				.filter(content => content.type === "pdf")
				.map(content => content.value.url);

			const articleContent = parsedContent
				.filter(content => content.type === "article")
				.map(content => content.value.content);

			const videoTranscripts = parsedContent
				.filter(content => content.type === "video")
				.map(content => content.value.url);

			console.log(
				`[RAG Worker] Found ${pdfUrls.length} PDFs, ${articleContent.length} articles, and ${videoTranscripts.length} videos to process.`
			);

			const result = await ragProcessor.processContent(
				lessonId,
				lesson.title,
				pdfUrls,
				articleContent,
				videoTranscripts
			);

			parentPort?.postMessage({
				success: true,
				result
			});

			return;
		}
	} catch (error) {
		console.error("[RAG Worker] Error:", error);
		parentPort?.postMessage({
			success: false,
			error: (error as Error).message
		});
	}
});

parentPort?.on("close", async () => {
	console.log("[RAG Worker] Shutting down, cleaning up resources...");

	await embeddingService.cleanup();
	await vectorStore.cleanup();
	await database.$disconnect();

	console.log("[RAG Worker] Cleanup complete");
});
