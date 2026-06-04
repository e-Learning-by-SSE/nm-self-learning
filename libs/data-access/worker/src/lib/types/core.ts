import { JobEventBusType } from "./events";

export interface JobContext {
	requestedBy?: string;
	tags?: string[];
}

export type JobRunner = {
	runJob<TResult>(
		jobId: string,
		name: string,
		payload: unknown,
		_context?: JobContext
	): Promise<{ result: TResult }>;
};

export type Context = {
	workerHost: JobRunner;
	events: JobEventBusType;
};
