import { downloadMultiple, downloadHtmlMultiple } from "./download";
import { LessonContent, Video, IFrame } from "@self-learning/types";

/**
 * Strip WebVTT formatting and return plain spoken text.
 * Removes the WEBVTT header, timestamp lines (e.g. "00:00:01.000 --> 00:00:04.000"),
 * and blank lines — leaving only the actual subtitle text lines joined by spaces.
 */
function extractPlainTextFromVtt(vtt: string): string {
	return vtt
		.split("\n")
		.filter(line => {
			const trimmed = line.trim();
			return (
				trimmed.length > 0 &&
				trimmed !== "WEBVTT" &&
				!/^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}/.test(trimmed)
			);
		})
		.join(" ")
		.trim();
}

/**
 * Prepare lesson content for RAG embedding
 */
export async function prepareRagContent(
	content: LessonContent,
	lessonContext?: { lessonId: string; lessonTitle: string }
): Promise<{
	pdfBuffers: Array<{ data: string; url: string }>;
	articleTexts: string[];
	transcriptTexts: string[];
	htmlPages: Array<{ data: string; url: string }>;
}> {
	const pdfUrls = content.filter(item => item.type === "pdf").map(item => item.value.url);
	const pdfBuffers = pdfUrls.length > 0 ? await downloadMultiple(pdfUrls, lessonContext) : [];

	const articleTexts = content
		.filter(item => item.type === "article")
		.map(item => item.value.content);

	const transcriptTexts = content
		.filter((item): item is Video => item.type === "video" && !!item.value.subtitle?.src)
		.map(item => extractPlainTextFromVtt(item.value.subtitle?.src ?? ""));

	// Only "html" (single uploaded file) and "zip" (unpacked entry-point page) are
	// fetchable, self-hosted content. "url" (external embed, or unset) is intentionally
	// skipped — we have no reliable way to extract meaningful text from an arbitrary
	// external page, same rationale as an unreachable PDF.
	const htmlUrls = content
		.filter(
			(item): item is IFrame =>
				item.type === "iframe" &&
				(item.value.source === "html" || item.value.source === "zip")
		)
		.map(item => item.value.url);
	const htmlPages =
		htmlUrls.length > 0 ? await downloadHtmlMultiple(htmlUrls, lessonContext) : [];

	return { pdfBuffers, articleTexts, transcriptTexts, htmlPages };
}
