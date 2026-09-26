import { NextApiRequest, NextApiResponse } from "next";

// Store response objects to send events to clients
const clients = new Map<string, NextApiResponse>();
// Track timeouts to clean up stale connections
const timeouts = new Map<string, NodeJS.Timeout>();

const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Manages SSE connections for course generation progress.
 *
 * - Establishes an SSE connection and sets necessary headers.
 * - Listens for events on a shared EventEmitter and forwards them to the client.
 * - Handles client disconnections and connection timeouts.
 * - Provides helper functions to emit events from other parts of the application.
 */
export default function courseGenerationEventsHandler(req: NextApiRequest, res: NextApiResponse) {
	const { generationId } = req.query;

	if (typeof generationId !== "string") {
		return res.status(400).json({ message: "Missing or invalid generationId" });
	}

	// Set headers for SSE
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache, no-transform");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();

	clients.set(generationId, res);

	const sendMessage = (event: string, data: unknown) => {
		res.write(`event: ${event}\n`);
		res.write(`data: ${JSON.stringify(data)}\n\n`);
	};
	console.log("New SSE connection for generationId:", generationId);

	sendMessage("connected", { generationId, timestamp: new Date().toISOString() });

	// Set a timeout to close the connection after a certain period of inactivity
	const timeout = setTimeout(() => {
		console.log(`[SSE] Connection timed out for generationId: ${generationId}`);
		sendMessage("timeout", { message: "Connection timed out." });
		cleanup(generationId);
	}, TIMEOUT_DURATION);
	timeouts.set(generationId, timeout);

	req.on("close", () => {
		console.log(`[SSE] Connection closed for generationId: ${generationId}`);
		cleanup(generationId);
	});
}

function cleanup(generationId: string) {
	clients.get(generationId)?.end();
	clients.delete(generationId);

	const timeout = timeouts.get(generationId);
	if (timeout) {
		clearTimeout(timeout);
		timeouts.delete(generationId);
	}
}


/**
 * Emits a "result" event to the specified client, with optional delay.
 * @param generationId - The unique identifier for the generation process.
 * @param data - The payload to send with the event.
 * @param delayMs - Optional delay in milliseconds before emitting the event.
 */
export function emitCourseGenerationResult(
	generationId: string,
	data: { slug: string },
	delayMs?: number
) {
	const res = clients.get(generationId);
	if (res) {
		const emit = () => {
			console.log(`[SSE] Emitting 'result' for generationId: ${generationId}`);
			res.write(`event: result\n`);
			res.write(`data: ${JSON.stringify(data)}\n\n`);
			resetTimeout(generationId);
		};
		if (delayMs && delayMs > 0) {
			setTimeout(emit, delayMs);
		} else {
			emit();
		}
	} else {
		console.warn(`[SSE] No client found for generationId: ${generationId} to emit result.`);
	}
}

/**
 * Emits an "error" event to the specified client.
 *
 * @param generationId - The unique identifier for the generation process.
 * @param data - The error details to send.
 */
/**
 * Emits an "error" event to the specified client, with optional delay.
 * @param generationId - The unique identifier for the generation process.
 * @param data - The error details to send.
 * @param delayMs - Optional delay in milliseconds before emitting the event.
 */
export function emitCourseGenerationError(
	generationId: string,
	data: { message: string },
	delayMs?: number
) {
	const res = clients.get(generationId);
	if (res) {
		const emit = () => {
			console.error(`[SSE] Emitting 'error' for generationId: ${generationId}`, data);
			res.write(`event: error\n`);
			res.write(`data: ${JSON.stringify(data)}\n\n`);
		};
		if (delayMs && delayMs > 0) {
			setTimeout(emit, delayMs);
		} else {
			emit();
		}
	} else {
		console.warn(`[SSE] No client found for generationId: ${generationId} to emit error.`);
	}
}

/** Resets the inactivity timeout for a given connection. */
function resetTimeout(generationId: string) {
	const existingTimeout = timeouts.get(generationId);
	if (existingTimeout) {
		clearTimeout(existingTimeout);
	}

	const newTimeout = setTimeout(() => {
		console.log(`[SSE] Connection timed out after reset for generationId: ${generationId}`);
		const res = clients.get(generationId);
		if (res) {
			res.write(`event: timeout\n`);
			res.write(`data: ${JSON.stringify({ message: "Connection timed out." })}\n\n`);
		}
		cleanup(generationId);
	}, TIMEOUT_DURATION);

	timeouts.set(generationId, newTimeout);
}
