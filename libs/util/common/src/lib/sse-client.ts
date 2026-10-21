import { useEffect, useState } from "react";

export type CourseGenerationEvent = {
	type: "connected" | "progress" | "result" | "error" | "timeout";
	data?: {
		slug?: string;
		message?: string;
		generationId?: string;
		timestamp?: string;
	};
};

type CourseGenerationListener = (event: CourseGenerationEvent) => void;

/**
 * A client for handling Server-Side Events (SSE) for course generation.
 *
 * Provides methods to connect to the SSE endpoint, manage the connection,
 * and handle incoming events.
 */
class CourseGenerationSSE {
	private eventSource: EventSource | null = null;
	private listener: CourseGenerationListener | null = null;

	/**
	 * Connects to the SSE endpoint for a given `generationId`.
	 *
	 * @param generationId - The ID of the course generation process.
	 * @param onEvent - A callback function to handle incoming events.
	 * @returns A promise that resolves when the connection is established or rejects on error.
	 */
	connect(generationId: string, onEvent: CourseGenerationListener): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.eventSource) {
				this.disconnect();
			}

			this.listener = onEvent;
			this.eventSource = new EventSource(
				`/api/course-generation-events?generationId=${generationId}`
			);

			this.eventSource.onopen = () => {
				resolve();
			};

			this.eventSource.onerror = error => {
				console.error("[SSE] Connection error:", error);
				this.listener?.({ type: "error", data: { message: "Connection failed." } });
				this.disconnect();
				reject(error);
			};

			this.eventSource.addEventListener("connected", event => {
				this.listener?.({ type: "connected", data: JSON.parse(event.data) });
			});

			this.eventSource.addEventListener("progress", event => {
				this.listener?.({ type: "progress", data: JSON.parse(event.data) });
			});

			this.eventSource.addEventListener("result", event => {
				this.listener?.({ type: "result", data: JSON.parse(event.data) });
				this.disconnect();
			});

			this.eventSource.addEventListener("error", event => {
				this.listener?.({ type: "error", data: JSON.parse((event as MessageEvent).data) });
				this.disconnect();
			});

			this.eventSource.addEventListener("timeout", event => {
				this.listener?.({ type: "timeout", data: JSON.parse(event.data) });
				this.disconnect();
			});
		});
	}

	/**
	 * Disconnects from the SSE endpoint and cleans up resources.
	 */
	disconnect() {
		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
		}
		this.listener = null;
	}
}

/**
 * React hook for subscribing to course generation Server-Side Events (SSE).
 *
 * @param generationId - The ID of the course generation process. If `null`, the hook will not connect.
 * @returns An object containing the latest event, connection status, and any connection error.
 */
export function useCourseGenerationSSE(generationId: string | null) {
	const [event, setEvent] = useState<CourseGenerationEvent | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!generationId) {
			return;
		}

		const sse = new CourseGenerationSSE();

		const handleEvent = (e: CourseGenerationEvent) => {
			console.log("Received SSE event:", e);
			setEvent(e);
			if (e.type === "error" && e.data?.message) {
				setError(e.data.message);
			}
		};

		sse.connect(generationId, handleEvent)
			.then(() => {
				console.log("SSE connected for generationId:", generationId);
				setIsConnected(true);
				setError(null);
			})
			.catch(() => {
				console.log("SSE connection failed");
				setIsConnected(false);
				setError("Failed to connect to the event stream.");
			});

		return () => {
			sse.disconnect();
			setIsConnected(false);
		};
	}, [generationId]);

	return { event, isConnected, error };
}
