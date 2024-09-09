import { trpc } from "@self-learning/api-client";
import { ActionPayloadTypes, Actions } from "@self-learning/types";
import { useCallback } from "react";

export type NewEventInput<K extends Actions> = {
	action: K;
	payload: ActionPayloadTypes[K];
	resourceId?: string;
	courseId?: string;
};

export function useEventLog() {
	const { mutateAsync } = trpc.events.create.useMutation();

	const newEvent = useCallback(
		async <K extends Actions>(event: NewEventInput<K>) => {
			await mutateAsync(event);
		},
		[mutateAsync]
	);

	return { newEvent };
}
