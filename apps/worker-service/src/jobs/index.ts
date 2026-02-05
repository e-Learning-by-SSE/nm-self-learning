/**
 * This file acts as the registry for all available background jobs.
 *
 * To add a new job:
 * 1. Create a new job file (e.g., `my-new-job.job.ts`) that exports a `Job` definition.
 * 2. Import the job definition in this file.
 * 3. Add the imported job to the `jobs` record below.
 */
import { JobDefinition } from "../lib/core/job-registry";
import { helloWorldJob } from "./hello-world.job";
import { pathGenerationJob } from "./path-generation.job";
import { JobKey } from "@self-learning/worker-api";

export type JobRegistry = {
	[K in JobKey]: JobDefinition<K>;
};

export const jobs: JobRegistry = {
	HelloWorld: helloWorldJob,
	pathGeneration: pathGenerationJob
};
