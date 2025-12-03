/* eslint-disable @typescript-eslint/no-explicit-any */
import { parentPort } from "worker_threads";
import { ragRetriever } from "@self-learning/ai-tutor/rag";
import { vectorStore } from "@self-learning/ai-tutor/rag";
import { database } from "@self-learning/database";
import { lessonContentSchema } from "@self-learning/types";

if (!parentPort) {
	throw new Error("This script must be run as a worker thread.");
}

parentPort.on("message", async data => {
	try {
		console.log(`[RAG Worker] Received task: ${data.type}`);
		switch (data.type) {
			case "embedLesson": {
				const result = await embedLesson(data.payload);
				parentPort?.postMessage({ success: true, result });
				break;
			}

			case "deleteEmbedding": {
				const result = await deleteEmbedding(data.payload.lessonId);
				parentPort?.postMessage({ success: true, result });
				break;
			}

			default:
				throw new Error(`Unknown task type: ${data.type}`);
		}
	} catch (error) {
		console.error("[RAG Worker] Error:", error);
		parentPort?.postMessage({
			success: false,
			error: (error as Error).message
		});
	}
});

async function embedLesson(payload: { lessonId: string }) {
	const { lessonId } = payload;

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

	// const videoTranscripts = parsedContent
	//     .filter(content => content.type === "video")
	//     .map(content => content.value.url); // later url will be replaced with transcript text
	const videoTranscripts: string[] = []; // Placeholder for future video transcript processing

	console.log(
		`[RAG Worker] Found ${pdfUrls.length} PDFs, ${articleContent.length} articles, and ${videoTranscripts.length} videos to process.`
	);

	return await ragRetriever.processcontent(
		lessonId,
		lesson.title,
		pdfUrls,
		articleContent,
		videoTranscripts
	);
}

async function deleteEmbedding(lessonId: string) {
	console.log(`[RAG Worker] Deleting embeddings for lesson: ${lessonId}`);
	await vectorStore.deletelesson(lessonId);
	return { lessonId, deleted: true };
}

console.log("[RAG Worker] Thread initialized and ready");
