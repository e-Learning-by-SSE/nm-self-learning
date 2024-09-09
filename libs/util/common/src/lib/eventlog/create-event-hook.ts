import { trpc } from "@self-learning/api-client";
import { ActionPayloadTypes, Actions } from "@self-learning/types";

export type NewEventInput<K extends Actions> = {
	action: K;
	payload: ActionPayloadTypes[K];
	resourceId?: string;
	courseId?: string;
};

export function useEventLog() {
	const { mutateAsync } = trpc.events.create.useMutation();
	async function newEvent<K extends Actions>(event: NewEventInput<K>) {
		await mutateAsync(event);
	}

	return { newEvent };
}
