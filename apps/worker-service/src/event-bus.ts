// eventBus.ts
import { EventEmitter, on } from "events";
import { JobEvent, JobEventBusType } from "@self-learning/worker-api";

class JobEventBus implements JobEventBusType {
	private ee = new EventEmitter();
	constructor() {
		// Optional: avoid MaxListeners warnings for many subscriptions
		this.ee.setMaxListeners(0);
	}

	// Use only this function to emit type-safe job events
	emitJobEvent(jobId: string, evt: JobEvent) {
		this.ee.emit(jobId, evt);
	}

	// Exposes the event stream to subscribers
	onJobEvent(jobId: string, opts: { signal: AbortSignal }): AsyncIterable<JobEvent> {
		const iterator = on(this.ee, jobId, { signal: opts.signal });
		return (async function* () {
			// Required to signal that the subscription is ready
			yield { type: "ready" } as const;

			// The actual events of type JobEvent
			for await (const [evt] of iterator) {
				yield evt as JobEvent;
			}
		})();
	}
}

// Singleton instance to ensure that always the same emitter is used
export const jobEvents = new JobEventBus();
