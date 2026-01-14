import { z } from "zod";

export interface JobContext {
	requestedBy?: string;
	tags?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface JobDefinition<TPayload = unknown, TResult = unknown> {
	name: string;
	description?: string;
	schema?: z.ZodType<TPayload>;
	run: (payload: TPayload, context: JobContext) => Promise<TResult>;
}
