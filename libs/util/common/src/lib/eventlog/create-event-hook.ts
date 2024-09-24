import { trpc } from "@self-learning/api-client";
import { EventLog, EventTypeKeys } from "@self-learning/types";
import { useCallback } from "react";
import { useSession } from "next-auth/react";

export function useEventLog() {
	const { mutateAsync } = trpc.events.create.useMutation();
	const session = useSession();
	const user = session.data?.user;

	if (user?.eventLogEnabled === true) {
		const newEvent = useCallback(
			async <K extends EventTypeKeys>(event: EventLog<K>) => {
				await mutateAsync(event);
			},
			[mutateAsync]
		);

		return { newEvent };
	} else {
		// Return a noop function if event logging is disabled
		return { newEvent: () => Promise.resolve() };
	}
}
