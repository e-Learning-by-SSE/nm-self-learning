import { EventEmitter } from "events";

type ReverseEvent = { type: "done"; value: string } | { type: "error"; message: string };

type HubState = {
	hub: EventEmitter;
	last: Map<string, ReverseEvent>;
};

const g = globalThis as unknown as { __reverseHub?: HubState };

const state: HubState =
	g.__reverseHub ??
	(g.__reverseHub = {
		hub: new EventEmitter(),
		last: new Map<string, ReverseEvent>()
	});

export const hub = state.hub;

export function publish(jobId: string, evt: ReverseEvent) {
	console.log("publish", jobId, evt.type);
	state.last.set(jobId, evt);
	state.hub.emit(jobId, evt);
	setTimeout(() => state.last.delete(jobId), 2 * 60_000);
}

export function getLast(jobId: string) {
	return state.last.get(jobId);
}
