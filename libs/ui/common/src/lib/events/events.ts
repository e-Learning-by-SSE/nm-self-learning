import { trpc } from "@self-learning/api-client";
import { EventWhereClause } from "@self-learning/api";
import {
	ActionPayloadTypes,
	Actions,
	userEventLogArraySchema,
	UserEvent
} from "@self-learning/types";

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

export function useEventLogQuery(where?: EventWhereClause) {
	const { data, isLoading } = trpc.events.get.useQuery(where ?? {});

	let validatedData: UserEvent[] | undefined = undefined;
	if (data) {
		// userEventLogArraySchema.parse(data);
		validatedData = data as unknown as UserEvent[];
	}

	return { data: validatedData, isLoading };
}
