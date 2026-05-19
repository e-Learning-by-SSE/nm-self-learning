// Data migration: embed all existing lessons into the vector store.
//
// Runs at deploy time (before the app starts), alongside `prisma migrate deploy`.
// Requires only the DB and ChromaDB to be up — no app, no worker-service needed.
// Safe to re-run: lessons with an existing ragVersionHash are skipped.

// use this command to run: npx tsx --tsconfig tsconfig.base.json libs/data-access/database/prisma/migrations/20260319073726_rag_support/data-migration.ts

import { PrismaClient, Prisma } from "@prisma/client";
import { prepareRagContent, getRagVersionHash } from "@self-learning/rag-processing";
import {
	contentProcessor,
	vectorStore,
	embeddingService
} from "@self-learning/rag-processing/services";

const prisma = new PrismaClient();

async function main() {
	try {
		const lessons = await prisma.lesson.findMany({
			where: {
				ragEnabled: true,
				NOT: {
					OR: [
						{ content: { equals: Prisma.JsonNull } },
						{ content: { equals: Prisma.DbNull } },
						{ content: { equals: [] } }
					]
				}
				// ragVersionHash: null // not yet embedded — idempotency guard
			},
			select: {
				lessonId: true,
				title: true,
				content: true
			}
		});
		let succeeded = 0;
		let failed = 0;
		for (const lesson of lessons) {
			try {
				// Step 1: Prepare content (download PDFs, extract article text)
				const { pdfBuffers, articleTexts, transcriptTexts } = await prepareRagContent(
					lesson.content
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
						await vectorStore.addDocuments(lesson.lessonId, chunks, embeddingService);
					}
				}
				if (articleTexts.length > 0) {
					const chunks = await contentProcessor.processArticles(
						articleTexts,
						lesson.lessonId,
						lesson.title
					);
					if (chunks.length > 0) {
						await vectorStore.addDocuments(lesson.lessonId, chunks, embeddingService);
					}
				}
				if (transcriptTexts.length > 0) {
					const chunks = await contentProcessor.processVideoTranscripts(
						transcriptTexts,
						lesson.lessonId,
						lesson.title
					);
					if (chunks.length > 0) {
						await vectorStore.addDocuments(lesson.lessonId, chunks, embeddingService);
					}
				}
				// Step 4: Mark as embedded so this lesson is skipped on re-runs
				await prisma.lesson.update({
					where: { lessonId: lesson.lessonId },
					data: {
						ragVersionHash: getRagVersionHash(
							JSON.stringify(lesson.content as Prisma.JsonArray)
						)
					}
				});
				succeeded++;
				console.log(
					`[RagMigration] ✓ Done (${succeeded + failed} / ${lessons.length}): ${lesson.title}`
				);
			} catch (error) {
				// Log and continue — one bad lesson should not abort the whole migration
				console.error(
					`[RagMigration] ✗ Failed: ${lesson.title} (${lesson.lessonId})`,
					error
				);
				failed++;
			}
		}
		console.log(`[RagMigration] Finished. succeeded=${succeeded}, failed=${failed}`);
	} finally {
		await prisma.$disconnect();
	}
}

main().catch(err => {
	console.error("[RagMigration] Unexpected error", err);
	process.exit(1);
});
