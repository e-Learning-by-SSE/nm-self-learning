/**
 * Retrieves the size of a file from a URL.
 * @param url A URL pointing to a resource (file)
 * @returns The size of the file in bytes
 */
export async function getFileSize(url: string): Promise<number> {
	try {
		const response = await fetch(url, { method: "HEAD" });
		const contentLength = response.headers.get("Content-Length");

		return contentLength !== null ? parseInt(contentLength, 10) : 0;
	} catch (error) {
		console.error("Error fetching resource head:", error);
		return 0;
	}
}

/**
 * Downloads a file from a URL and reports progress.
 * Based on: https://stackoverflow.com/a/64123890
 * @param url The URL to download from
 * @param onProgress A callback to inform about the progress (downloaded bytes)
 * @returns A binary blob (contents) of the downloaded resource
 * @see https://stackoverflow.com/a/64123890
 */
export async function downloadWithProgress(url: string, onProgress?: (bytes: number) => void) {
	const response = await fetch(url);

	// Ensure the response is stream-able
	if (!response.body) {
		throw new Error("ReadableStream not yet supported in this browser.");
	}

	let loaded = 0;

	const res = new Response(
		new ReadableStream({
			async start(controller) {
				if (response.body) {
					const reader = response.body.getReader();
					for (;;) {
						const { done, value } = await reader.read();

						if (done) break;

						loaded += value.byteLength;
						onProgress && onProgress(loaded);

						controller.enqueue(value);
					}
					controller.close();
				}
			}
		})
	);

	const blob = await res.blob();
	return blob;
}
