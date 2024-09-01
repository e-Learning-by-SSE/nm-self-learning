import { trpc } from "@self-learning/api-client";
import { ActionPayloadTypes, Actions } from "@self-learning/types";

export function useEventLog() {
	const { mutateAsync } = trpc.events.create.useMutation();

	async function newEvent<K extends Actions>(event: {
		action: K;
		payload: ActionPayloadTypes[K];
		resourceId?: string;
	}) {
		await mutateAsync(event);
	}

	return { newEvent };
}
