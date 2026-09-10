import { Prisma } from "@prisma/client";
import {
	prepareRagContent,
	getRagVersionHash,
	processRagEmbedLesson
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
		const { pdfBuffers, articleTexts, transcriptTexts, htmlPages, h5pSources } =
			await prepareRagContent(lesson.content as LessonContent);

		// Step 2: Process and embed via shared RAG pipeline
		const embedResult = await processRagEmbedLesson({
			lessonId: lesson.lessonId,
			lessonTitle: lesson.title,
			pdfBuffers,
			articleTexts,
			transcriptTexts,
			htmlPages,
			h5pSources
		}).catch(error => {
			console.error(
				`[TranscriptionEmbedding] ✗ Embedding failed (non-fatal): ${lesson.title} (${lesson.lessonId})`,
				error
			);
			return null;
		});

		if (!embedResult) {
			return;
		}

		// Step 3: Mark as embedded so this lesson is skipped on re-runs
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
