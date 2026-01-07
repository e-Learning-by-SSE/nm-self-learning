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

export class JobRegistry {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private jobs = new Map<string, JobDefinition<any, any>>();

	register<TPayload, TResult>(job: JobDefinition<TPayload, TResult>) {
		this.jobs.set(job.name, job);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	get(name: string): JobDefinition<any, any> | undefined {
		return this.jobs.get(name);
	}

	list() {
		return Array.from(this.jobs.values()).map(job => ({
			name: job.name,
			description: job.description
		}));
	}

	describe(name: string) {
		const job = this.jobs.get(name);
		if (!job) return undefined;
		return {
			name: job.name,
			description: job.description
		};
	}
}
