import { parentPort } from "worker_threads";
import { jobs } from "./jobs";
import { JobDefinition } from "./lib/core/job-registry";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jobMap = new Map<string, JobDefinition<any, any>>();
for (const job of jobs) {
	jobMap.set(job.name, job);
}

if (!parentPort) {
	throw new Error("Worker must be spawned with a parent port");
}

parentPort.on("message", async message => {
	const { id, jobName, payload } = message;

	try {
		const job = jobMap.get(jobName);

		if (!job) {
			throw new Error(`Job ${jobName} not found`);
		}

		const result = await job.run(payload, {});
		parentPort?.postMessage({ id, result });
	} catch (error) {
		parentPort?.postMessage({
			id,
			error: error instanceof Error ? error.message : String(error)
		});
	}
});
