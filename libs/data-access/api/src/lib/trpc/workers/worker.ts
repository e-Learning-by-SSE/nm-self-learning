import { Worker } from "worker_threads";

export class ThreadWorker {
	private worker: Worker;

	constructor(workerPath: string) {
		this.worker = new Worker(workerPath);
	}

	runTask(data: any) {
		return new Promise((resolve, reject) => {
			this.worker.once("message", resolve);
			this.worker.once("error", reject);
			this.worker.postMessage(data);
		});
	}

	terminate() {
		this.worker.terminate();
	}
}
