import { lessonContentSchema, downloadMultiple } from "@self-learning/rag-processing";
import { PreparedContent } from "../types/content";
/**
 * Prepare lesson content for RAG embedding
 */
export async function prepareRagContent(content: unknown): Promise<PreparedContent> {
	const parsed = lessonContentSchema.array().parse(content);

	const pdfUrls = parsed.filter(item => item.type === "pdf").map(item => item.value.url);
	console.log("[RagPrep] Downloading PDFs", { count: pdfUrls.length });
	const pdfBuffers = pdfUrls.length > 0 ? await downloadMultiple(pdfUrls) : [];

	const articleTexts = parsed
		.filter(item => item.type === "article")
		.map(item => item.value.content);

	const transcriptTexts: string[] = []; // Skip videos until implemented
	console.log("[RagPrep] Skipping video transcripts (not yet implemented)");

	console.log("[RagPrep] Content prepared", {
		pdfCount: pdfBuffers.length,
		articleCount: articleTexts.length,
		transcriptCount: transcriptTexts.length
	});

	return { pdfBuffers, articleTexts, transcriptTexts };
}

// test
