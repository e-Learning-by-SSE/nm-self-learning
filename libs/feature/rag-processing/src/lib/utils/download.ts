import { RAG_CONFIG } from "../config/rag-config";

/**
 * Error thrown when download fails after all retries
 */
export class DownloadError extends Error {
	constructor(
		message: string,
		public url: string,
		public sourceError?: Error
	) {
		super(message);
		this.name = "DownloadError";
	}
}

function validateURL(url: string): void {
	try {
		const parsed = new URL(url);
		if (!["http:", "https:"].includes(parsed.protocol)) {
			throw new Error("Only HTTP/HTTPS protocols are supported");
		}
	} catch (error) {
		throw new DownloadError(`Invalid URL format: ${url}`, url, error as Error);
	}
}

export async function downloadWithRetry(
	url: string,
	options: {
		maxRetries?: number;
		timeoutMs?: number;
		userAgent?: string;
		/**
		 * Content-type substrings that are considered valid for this download.
		 * Defaults to PDF for backwards compatibility with existing call sites.
		 * "octet-stream" is always accepted since some servers mislabel binary/static files.
		 */
		expectedContentTypes?: string[];
	} = {}
): Promise<Uint8Array> {
	const maxRetries = options.maxRetries ?? RAG_CONFIG.DOWNLOAD.MAX_RETRIES;
	const timeoutMs = options.timeoutMs ?? RAG_CONFIG.DOWNLOAD.TIMEOUT_MS;
	const userAgent = options.userAgent ?? RAG_CONFIG.DOWNLOAD.USER_AGENT;
	const expectedContentTypes = options.expectedContentTypes ?? ["application/pdf"];

	validateURL(url);
	let lastError: Error | undefined;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), timeoutMs);
			let response: Response;
			try {
				response = await fetch(url, {
					headers: { "User-Agent": userAgent },
					signal: controller.signal
				});
			} finally {
				clearTimeout(timeout);
			}

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const contentType = response.headers.get("content-type") ?? "";
			const isAccepted =
				expectedContentTypes.some(t => contentType.includes(t)) ||
				contentType.includes("octet-stream");
			if (!isAccepted) {
				throw new DownloadError(
					`URL did not return an expected content type (expected one of [${expectedContentTypes.join(", ")}], got "${contentType}"). The file may have moved or requires authentication.`,
					url
				);
			}

			const contentLength = response.headers.get("content-length");
			if (contentLength) {
				const sizeMB = parseInt(contentLength) / 1024 / 1024;
				if (sizeMB > RAG_CONFIG.DOWNLOAD.MAX_FILE_SIZE_MB) {
					throw new Error(`File size (${sizeMB.toFixed(2)}MB) exceeds limit`);
				}
			}

			const arrayBuffer = await response.arrayBuffer();
			return new Uint8Array(arrayBuffer);
		} catch (error) {
			lastError = error as Error;
		}

		if (attempt < maxRetries) {
			const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000);
			await new Promise(resolve => setTimeout(resolve, delayMs));
		}
	}
	throw new DownloadError(
		`Failed to download ${url} after ${maxRetries} attempts: ${lastError?.message ?? String(lastError)}`,
		url,
		lastError
	);
}

export async function downloadMultiple(
	urls: string[],
	lessonContext?: { lessonId: string; lessonTitle: string }
): Promise<Array<{ data: string; url: string }>> {
	if (!RAG_CONFIG.DOWNLOAD.PARALLEL_DOWNLOADS) {
		// Sequential download
		const results: Array<{ data: string; url: string }> = [];
		for (const url of urls) {
			try {
				const buffer = await downloadWithRetry(url);
				const base64 = Buffer.from(buffer).toString("base64");
				results.push({ data: base64, url });
				console.log("[DownloadUtil] Downloaded file sequentially", { url });
			} catch (error) {
				console.warn(
					"[DownloadUtil] Skipping PDF due to download error — other content types will still be processed",
					{
						...lessonContext,
						url,
						error: error instanceof Error ? error.message : String(error)
					}
				);
			}
		}
		return results;
	}

	const downloads = urls.map(async url => {
		try {
			const buffer = await downloadWithRetry(url);
			const base64 = Buffer.from(buffer).toString("base64");
			return { data: base64, url };
		} catch (error) {
			console.warn(
				"[DownloadUtil] Skipping PDF due to download error — other content types will still be processed",
				{
					...lessonContext,
					url,
					error: error instanceof Error ? error.message : String(error)
				}
			);
			return null;
		}
	});

	const results = await Promise.all(downloads);
	return results.filter((r): r is { data: string; url: string } => r !== null);
}

/**
 * Downloads uploaded single-file HTML pages for RAG processing.
 * Mirrors downloadMultiple's fail-soft behavior: a failed download is logged and skipped
 * so it never aborts processing of the rest of the lesson's content.
 */
export async function downloadHtmlMultiple(
	urls: string[],
	lessonContext?: { lessonId: string; lessonTitle: string }
): Promise<Array<{ data: string; url: string }>> {
	const downloads = urls.map(async url => {
		try {
			const buffer = await downloadWithRetry(url, {
				expectedContentTypes: ["text/html"]
			});
			const base64 = Buffer.from(buffer).toString("base64");
			return { data: base64, url };
		} catch (error) {
			console.warn(
				"[DownloadUtil] Skipping HTML content due to download error — other content types will still be processed",
				{
					...lessonContext,
					url,
					error: error instanceof Error ? error.message : String(error)
				}
			);
			return null;
		}
	});

	const results = await Promise.all(downloads);
	return results.filter((r): r is { data: string; url: string } => r !== null);
}

/**
 * Downloads JSON files (H5P's `h5p.json` and `content/content.json`) for RAG processing.
 * Mirrors downloadHtmlMultiple's fail-soft behavior.
 */
export async function downloadJsonMultiple(
	urls: string[],
	lessonContext?: { lessonId: string; lessonTitle: string }
): Promise<Array<{ data: string; url: string }>> {
	const downloads = urls.map(async url => {
		try {
			const buffer = await downloadWithRetry(url, {
				expectedContentTypes: ["json"]
			});
			const base64 = Buffer.from(buffer).toString("base64");
			return { data: base64, url };
		} catch (error) {
			console.warn(
				"[DownloadUtil] Skipping JSON file due to download error — other content types will still be processed",
				{
					...lessonContext,
					url,
					error: error instanceof Error ? error.message : String(error)
				}
			);
			return null;
		}
	});

	const results = await Promise.all(downloads);
	return results.filter((r): r is { data: string; url: string } => r !== null);
}
