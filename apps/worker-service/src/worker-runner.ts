import { parentPort } from "worker_threads";
import { JobRegistry } from "./lib/core/job-registry";
import { registerAllJobs } from "./jobs";

const registry = new JobRegistry();
registerAllJobs(registry);

if (!parentPort) {
	throw new Error("Worker must be spawned with a parent port");
}

parentPort.on("message", async message => {
	const { id, jobName, payload } = message;

	try {
		const job = registry.get(jobName);

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
