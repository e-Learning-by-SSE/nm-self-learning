import { Prisma } from "@prisma/client";
import {
	prepareRagContent,
	getRagVersionHash,
	contentProcessor,
	vectorStore
} from "@self-learning/rag-processing";
import { database } from "@self-learning/database";
import { LessonContent } from "@self-learning/types";

export async function embedLesson(lessonId: string) {
	const lesson = await database.lesson.findUnique({
		where: { lessonId }
	});

	if (!lesson) {
		console.error(`[TranscriptionEmbedding] ✗ Lesson not found: ${lessonId}`);
		return;
	}

	try {
		// Step 1: Prepare content (download PDFs, extract article text)
		const { pdfBuffers, articleTexts, transcriptTexts } = await prepareRagContent(
			lesson.content as LessonContent
		);
		// Step 2: Clean up any stale vector data for this lesson
		const exists = await vectorStore.lessonExists(lesson.lessonId);
		if (exists) {
			await vectorStore.deleteLesson(lesson.lessonId);
		}
		// Step 3: Process and embed — mirrors ragEmbedJob.run() exactly
		if (pdfBuffers.length > 0) {
			const chunks = await contentProcessor.processMultiplePDFs(
				pdfBuffers,
				lesson.lessonId,
				lesson.title
			);
			if (chunks.length > 0) {
				await vectorStore.addDocuments(lesson.lessonId, chunks);
			}
		}
		if (articleTexts.length > 0) {
			const chunks = await contentProcessor.processArticles(
				articleTexts,
				lesson.lessonId,
				lesson.title
			);
			if (chunks.length > 0) {
				await vectorStore.addDocuments(lesson.lessonId, chunks);
			}
		}
		if (transcriptTexts.length > 0) {
			const chunks = await contentProcessor.processVideoTranscripts(
				transcriptTexts,
				lesson.lessonId,
				lesson.title
			);
			if (chunks.length > 0) {
				await vectorStore.addDocuments(lesson.lessonId, chunks);
			}
		}
		// Step 4: Mark as embedded so this lesson is skipped on re-runs
		await database.lesson.update({
			where: { lessonId: lesson.lessonId },
			data: {
				ragVersionHash: getRagVersionHash(
					JSON.stringify(lesson.content as Prisma.JsonArray)
				)
			}
		});
		console.log(
			`[TranscriptionEmbedding] ${lesson.title} (${lesson.lessonId}) embedded successfully.`
		);
	} catch (error) {
		// Log and continue — one bad lesson should not abort the whole migration
		console.error(
			`[TranscriptionEmbedding] ✗ Failed: ${lesson.title} (${lesson.lessonId})`,
			error
		);
	}
}
