import { trpc } from "@self-learning/api-client";
import { EventLog, EventTypeKeys } from "@self-learning/types";
import { useCallback } from "react";

export function useEventLog() {
	const { mutateAsync } = trpc.events.create.useMutation();

	const newEvent = useCallback(
		async <K extends EventTypeKeys>(event: EventLog<K>) => {
			await mutateAsync(event);
		},
		[mutateAsync]
	);

	return { newEvent };
}
