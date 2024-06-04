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
 * @param signal An abort signal to allow aborting the download by the user. Created via AbortController.
 * @param onProgress A callback to inform about the progress (downloaded bytes)
 * @returns A binary blob (contents) of the downloaded resource
 * @throws Error if a resource cannot be downloaded or the page is reloaded during action (will abort the stream unexpectedly)
 * @see https://stackoverflow.com/a/64123890
 */
export async function downloadWithProgress(
	url: string,
	signal: AbortSignal,
	onProgress?: (bytes: number) => void
) {
	const response = await fetch(url, { signal });

	// Ensure the response is stream-able
	if (!response.body) {
		throw new Error("ReadableStream not yet supported in this browser.");
	}

	let loaded = 0;

	const res = new Response(
		new ReadableStream({
			async start(controller) {
				try {
					if (response.body) {
						const reader = response.body.getReader();
						for (;;) {
							const { done, value } = await reader.read();

							// Exit if we're done, ensures also that value is not null
							if (done) break;

							// Update the progress
							loaded += value.byteLength;
							onProgress && onProgress(loaded);

							// Enqueue the next chunk
							controller.enqueue(value);
						}
						controller.close();
					}
				} catch (error) {
					// Throw only the exception if the download was not aborted by the user
					if (!(error instanceof DOMException && error.name === "AbortError")) {
						throw error;
					}
				}
			}
		})
	);

	return await res.blob();
}
