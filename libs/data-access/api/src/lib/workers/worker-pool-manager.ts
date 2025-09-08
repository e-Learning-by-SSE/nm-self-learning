import path from "path";
import { WorkerPool } from "./worker-pool";

class WorkerPoolManager {
	private static instance: WorkerPoolManager;
	private pathGenerationPool?: WorkerPool;

	private constructor() {}

	public static getInstance(): WorkerPoolManager {
		if (!WorkerPoolManager.instance) {
			WorkerPoolManager.instance = new WorkerPoolManager();
		}
		return WorkerPoolManager.instance;
	}

	public getPathGenerationPool(): WorkerPool {
		if (!this.pathGenerationPool) {
			this.pathGenerationPool = new WorkerPool({
				workerPath: path.join(
					process.cwd(),
					"../../",
					"dist/apps/site/workers/path_worker_thread.js"
				),
				minWorkers: 2,
				maxWorkers: 6,
				maxIdleTime: 100000 
			});

			// Log pool events for monitoring
			this.pathGenerationPool.on("workerCreated", workerId => {
				console.log(`[WorkerPool] Path generation worker ${workerId} created`);
			});

			this.pathGenerationPool.on("workerRemoved", workerId => {
				console.log(`[WorkerPool] Path generation worker ${workerId} removed`);
			});

			this.pathGenerationPool.on("workersCleanedUp", count => {
				console.log(`[WorkerPool] Cleaned up ${count} idle workers`);
			});
		}
		return this.pathGenerationPool;
	}

	public async terminate(): Promise<void> {
		if (this.pathGenerationPool) {
			await this.pathGenerationPool.terminate();
			this.pathGenerationPool = undefined;
		}
	}

	public getStats() {
		return {
			pathGeneration: this.pathGenerationPool?.getStats() || null
		};
	}
}

export const workerPoolManager = WorkerPoolManager.getInstance();
