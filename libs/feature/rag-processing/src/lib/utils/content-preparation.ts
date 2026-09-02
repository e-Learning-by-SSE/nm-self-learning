import { downloadMultiple, downloadHtmlMultiple, downloadJsonMultiple } from "./download";
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
	h5pSources: Array<{
		h5pJson: { data: string; url: string } | null;
		contentJson: { data: string; url: string } | null;
	}>;
}> {
	const pdfUrls = content.filter(item => item.type === "pdf").map(item => item.value.url);
	const pdfBuffers = pdfUrls.length > 0 ? await downloadMultiple(pdfUrls, lessonContext) : [];

	const articleTexts = content
		.filter(item => item.type === "article")
		.map(item => item.value.content);

	const transcriptTexts = content
		.filter((item): item is Video => item.type === "video" && !!item.value.subtitle?.src)
		.map(item => extractPlainTextFromVtt(item.value.subtitle?.src ?? ""));

	/**
	 * Only "html" (single uploaded file) is fetchable, self-hosted content we process.
	 * "url" (external embed, or unset) and "zip" are intentionally skipped: "url" because
	 * we have no reliable way to extract meaningful text from an arbitrary external page,
	 * and "zip" because relying on filename/format conventions of whatever authoring tool
	 * produced the archive isn't something we want to depend on (not standardized, and in
	 * practice often not even open — see the ActivePresenter case).
	 */
	const htmlUrls = content
		.filter((item): item is IFrame => item.type === "iframe" && item.value.source === "html")
		.map(item => item.value.url);
	const htmlPages =
		htmlUrls.length > 0 ? await downloadHtmlMultiple(htmlUrls, lessonContext) : [];

	/**
	 * H5P packages are unpacked to plain-file storage at upload time (see storage_router's
	 * unpackArchive), so value.url is already a folder URL — no unzip needed here, just
	 * fetch h5p.json (title/metadata) and content/content.json (the authored text) directly.
	 */
	const h5pFolderUrls = content
		.filter((item): item is IFrame => item.type === "iframe" && item.value.source === "h5p")
		.map(item => item.value.url);

	const h5pSources: Array<{
		h5pJson: { data: string; url: string } | null;
		contentJson: { data: string; url: string } | null;
	}> = [];

	if (h5pFolderUrls.length > 0) {
		const h5pJsonUrls = h5pFolderUrls.map(folderUrl => `${folderUrl}/h5p.json`);
		const contentJsonUrls = h5pFolderUrls.map(folderUrl => `${folderUrl}/content/content.json`);

		const [h5pJsonResults, contentJsonResults] = await Promise.all([
			downloadJsonMultiple(h5pJsonUrls, lessonContext),
			downloadJsonMultiple(contentJsonUrls, lessonContext)
		]);

		for (const folderUrl of h5pFolderUrls) {
			const h5pJson = h5pJsonResults.find(r => r.url === `${folderUrl}/h5p.json`) ?? null;
			const contentJson =
				contentJsonResults.find(r => r.url === `${folderUrl}/content/content.json`) ?? null;
			// Only include if at least one of the two files was actually retrieved
			if (h5pJson || contentJson) {
				h5pSources.push({ h5pJson, contentJson });
			}
		}
	}

	return { pdfBuffers, articleTexts, transcriptTexts, htmlPages, h5pSources };
}
