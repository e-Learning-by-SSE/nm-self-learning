// Data migration: embed all existing lessons into the vector store.
//
// Runs at deploy time (before the app starts), alongside `prisma migrate deploy`.
// Requires only the DB and ChromaDB to be up — no app, no worker-service needed.
// Safe to re-run: lessons with an existing ragVersionHash are skipped.

// use this command to run: npx tsx --tsconfig tsconfig.base.json libs/data-access/database/prisma/migrations/20260319073726_rag_support/data-migration.ts

import { PrismaClient, Prisma } from "@prisma/client";
import {
	prepareRagContent,
	getRagVersionHash,
	processRagEmbedLesson
} from "@self-learning/rag-processing";

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
				const { pdfBuffers, articleTexts, transcriptTexts, htmlPages, h5pSources } =
					await prepareRagContent(lesson.content);

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
						`[RagMigration] ✗ Embedding failed (non-fatal): ${lesson.title} (${lesson.lessonId})`,
						error
					);
					return null;
				});

				if (!embedResult) {
					failed++;
					continue;
				}

				// Step 3: Mark as embedded so this lesson is skipped on re-runs
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
