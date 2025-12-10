import { JobRegistry } from "../lib/core/job-registry";
import { pathGenerationJob } from "./path-generation.job";

export function registerAllJobs(registry: JobRegistry) {
	registry.register(pathGenerationJob);
}
