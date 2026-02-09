import { RAG_CONFIG } from "../config/rag-config";

/**
 * Error thrown when download fails after all retries
 */
export class DownloadError extends Error {
	constructor(
		message: string,
		public url: string,
		public cause?: Error
	) {
		super(message);
		this.name = "DownloadError";
	}
}

/**
 * Validate URL format
 */
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

/**
 * Download a file with retry logic and timeout
 */
export async function downloadWithRetry(
	url: string,
	options: { maxRetries?: number; timeoutMs?: number; userAgent?: string } = {}
): Promise<Uint8Array> {
	const maxRetries = options.maxRetries ?? RAG_CONFIG.DOWNLOAD.MAX_RETRIES;
	const timeoutMs = options.timeoutMs ?? RAG_CONFIG.DOWNLOAD.TIMEOUT_MS;
	const userAgent = options.userAgent ?? RAG_CONFIG.DOWNLOAD.USER_AGENT;

	validateURL(url);

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			console.log("[DownloadUtil] Attempting to download file", { attempt, maxRetries });

			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), timeoutMs);

			const response = await fetch(url, {
				headers: { "User-Agent": userAgent },
				signal: controller.signal
			});

			clearTimeout(timeout);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const contentLength = response.headers.get("content-length");
			if (contentLength) {
				const sizeMB = parseInt(contentLength) / 1024 / 1024;
				if (sizeMB > RAG_CONFIG.DOWNLOAD.MAX_FILE_SIZE_MB) {
					throw new Error(`File size (${sizeMB.toFixed(2)}MB) exceeds limit`);
				}
			}

			const arrayBuffer = await response.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);

			console.log("[DownloadUtil] Downloaded file successfully", {
				sizeKB: (uint8Array.length / 1024).toFixed(2)
			});

			return uint8Array;
		} catch (error) {
			const isLastAttempt = attempt === maxRetries;

			if (isLastAttempt) {
				const message = error instanceof Error ? error.message : String(error);
				console.error("[DownloadUtil] Download failed after all retries", error as Error, {
					attempts: maxRetries
				});
				throw new DownloadError(
					`Failed to download ${url} after ${maxRetries} attempts: ${message}`,
					url,
					error as Error
				);
			}

			// Exponential backoff
			const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000);
			console.log("[DownloadUtil] Download attempt failed, retrying", {
				attempt,
				retryInMs: delayMs
			});

			await new Promise(resolve => setTimeout(resolve, delayMs));
		}
	}

	// TypeScript safety - should never reach here
	throw new DownloadError(`Unexpected error downloading ${url}`, url);
}

/**
 * Download multiple files in parallel
 */
export async function downloadMultiple(
	urls: string[]
): Promise<Array<{ data: string; url: string }>> {
	if (!RAG_CONFIG.DOWNLOAD.PARALLEL_DOWNLOADS) {
		// Sequential download
		const results: Array<{ data: string; url: string }> = [];
		for (const url of urls) {
			const buffer = await downloadWithRetry(url);
			const base64 = Buffer.from(buffer).toString("base64");
			results.push({ data: base64, url });
			console.log("[DownloadUtil] Downloaded file sequentially", { url });
		}
		return results;
	}

	// Parallel download
	console.log("[DownloadUtil] Downloading files in parallel", { count: urls.length });

	const downloads = urls.map(async url => {
		const buffer = await downloadWithRetry(url);
		const base64 = Buffer.from(buffer).toString("base64");
		return { data: base64, url };
	});

	return Promise.all(downloads);
}
