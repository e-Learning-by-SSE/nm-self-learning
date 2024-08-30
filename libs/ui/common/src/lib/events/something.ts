import { ActionPayloadTypes, Actions } from "@self-learning/types";
import { database } from "@self-learning/database";

export function createUserEvent<K extends Actions>(event: {
	userId: string;
	action: K;
	resourceId?: string;
	payload: ActionPayloadTypes[K];
}) {
	console.log("hallo");
	return database.eventLog.create({ data: event });
}
