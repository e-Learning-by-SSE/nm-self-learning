"use client";
import { EventLog, EventTypeKeys } from "@self-learning/types";
import { trpc } from "@self-learning/api-client";
import { useRef, useCallback, useEffect } from "react";

export function useEventLog() {
	const { mutateAsync } = trpc.events.create.useMutation();

	// Prevents duplicate event submissions during development.
	// React.StrictMode intentionally double-invokes lifecycle methods (e.g., useEffect)
	// to detect side-effects. This can cause duplicate logs unless filtered.
	const sentEvents = useRef(new Set<string>());

	const newEvent = useCallback(
		async <K extends EventTypeKeys>(event: EventLog<K>) => {
			// Generate a unique key for this event. Customize if needed.
			const eventKey = JSON.stringify(event);

			// Skip if we've already logged this exact event.
			if (sentEvents.current.has(eventKey)) return;

			sentEvents.current.add(eventKey);

			await mutateAsync(event);
		},
		[mutateAsync]
	);

	useEffect(() => console.log("MutateAsyncChanged"), [mutateAsync]);

	return { newEvent };
}
