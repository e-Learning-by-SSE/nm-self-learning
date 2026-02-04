import { z } from "zod";
import { JobKey, PayloadFor, ReturnTypeOf } from "@self-learning/worker-api";

export interface JobContext {
	requestedBy?: string;
	tags?: string[];
}

export interface JobDefinition<T extends JobKey> {
	name: T;
	description?: string;
	schema?: z.ZodType<PayloadFor<T>>;
	run: (payload: PayloadFor<T>, context: JobContext) => Promise<ReturnTypeOf<T>>;
}
