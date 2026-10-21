import type { JobKey, PayloadFor, ReturnTypeOf } from "@self-learning/worker-api";

export interface JobContext {
	requestedBy?: string;
	tags?: string[];
}

export interface JobDefinition<T extends JobKey> {
	name: T;
	description?: string;
	run: (payload: PayloadFor<T>, context: JobContext) => Promise<ReturnTypeOf<T>>;
}
