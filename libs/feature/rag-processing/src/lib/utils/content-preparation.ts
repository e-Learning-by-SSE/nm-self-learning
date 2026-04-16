import { downloadMultiple } from "@self-learning/rag-processing";
import { LessonContent } from "@self-learning/types";

/**
 * Prepare lesson content for RAG embedding
 */
export async function prepareRagContent(content: LessonContent): Promise<{
	pdfBuffers: Array<{ data: string; url: string }>;
	articleTexts: string[];
	transcriptTexts: string[];
}> {
	const pdfUrls = content.filter(item => item.type === "pdf").map(item => item.value.url);
	const pdfBuffers = pdfUrls.length > 0 ? await downloadMultiple(pdfUrls) : [];

	const articleTexts = content
		.filter(item => item.type === "article")
		.map(item => item.value.content);

	const transcriptTexts: string[] = []; // Skip videos until implemented
	return { pdfBuffers, articleTexts, transcriptTexts };
}
