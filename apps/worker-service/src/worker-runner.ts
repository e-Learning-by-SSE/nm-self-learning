import { parentPort } from "worker_threads";
import { jobs } from "./jobs";

if (!parentPort) {
	throw new Error("Worker must be spawned with a parent port");
}

parentPort.on("message", async message => {
	const { id, jobName, payload } = message;

	try {
		const job = jobs[jobName];

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
