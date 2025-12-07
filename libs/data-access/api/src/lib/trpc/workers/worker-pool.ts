import { Worker } from "worker_threads";
import { EventEmitter } from "events";

interface WorkerTask<T = unknown, R = unknown> {
	id: string;
	data: T;
	resolve: (value: R) => void;
	reject: (error: Error) => void;
	timestamp: number;
}

interface PoolWorker {
	worker: Worker;
	busy: boolean;
	id: number;
	lastUsed: number;
	currentTask: WorkerTask<unknown, unknown> | null;
}

export class WorkerPool extends EventEmitter {
	private workers: PoolWorker[] = [];
	private taskQueue: WorkerTask<unknown, unknown>[] = [];
	private readonly maxWorkers: number;
	private readonly minWorkers: number;
	private readonly maxIdleTime: number;
	private readonly workerPath: string;
	private workerIdCounter = 0;
	private cleanupInterval?: NodeJS.Timeout;

	constructor(options: {
		workerPath: string;
		minWorkers?: number;
		maxWorkers?: number;
		maxIdleTime?: number;
	}) {
		super();
		this.workerPath = options.workerPath;
		this.minWorkers = options.minWorkers ?? 2;
		this.maxWorkers = options.maxWorkers ?? 4;
		this.maxIdleTime = options.maxIdleTime ?? 10000;

		this.initializePool();

		this.startCleanupInterval();
	}

	private async initializePool(): Promise<void> {
		for (let i = 0; i < this.minWorkers; i++) {
			await this.createWorker();
		}
	}

	private async createWorker(): Promise<PoolWorker> {
		const worker = new Worker(this.workerPath);
		const poolWorker: PoolWorker = {
			worker,
			busy: false,
			id: this.workerIdCounter++,
			lastUsed: Date.now(),
			currentTask: null
		};

		worker.on("error", error => {
			this.handleWorkerError(poolWorker, error);
		});

		worker.on("exit", code => {
			if (code !== 0) {
				console.error(`Worker ${poolWorker.id} stopped with exit code ${code}`);
				if (poolWorker.currentTask) {
					poolWorker.currentTask.reject(
						new Error(`Worker stopped with exit code ${code}`)
					);
				}
				this.removeWorker(poolWorker);
			}
		});

		this.workers.push(poolWorker);
		this.emit("workerCreated", poolWorker.id);
		return poolWorker;
	}

	private handleWorkerMessage(
		poolWorker: PoolWorker,
		result: unknown,
		task: WorkerTask<unknown, unknown>
	): void {
		task.resolve(result);
		this.finishTask(poolWorker);
	}

	private handleWorkerError(poolWorker: PoolWorker, error: Error): void {
		console.error(`Worker ${poolWorker.id} error:`, error);

		if (poolWorker.currentTask) {
			poolWorker.currentTask.reject(error);
		}

		// Remove the worker as it might be in a broken state
		this.removeWorker(poolWorker);

		// Ensure pool maintains minimum worker count
		if (this.workers.length < this.minWorkers) {
			this.createWorker().catch(err => console.error("Failed to recreate worker:", err));
		}

		this.processNextTask();
	}

	private finishTask(poolWorker: PoolWorker): void {
		poolWorker.busy = false;
		poolWorker.lastUsed = Date.now();
		poolWorker.currentTask = null;
		this.processNextTask();
	}

	private removeWorker(poolWorker: PoolWorker): void {
		const index = this.workers.indexOf(poolWorker);
		if (index > -1) {
			this.workers.splice(index, 1);
			poolWorker.worker.terminate();
			this.emit("workerRemoved", poolWorker.id);
		}
	}

	private getAvailableWorker(): PoolWorker | null {
		return this.workers.find(worker => !worker.busy) || null;
	}

	private async ensureWorkerAvailable(): Promise<PoolWorker | null> {
		let availableWorker = this.getAvailableWorker();

		if (!availableWorker && this.workers.length < this.maxWorkers) {
			try {
				availableWorker = await this.createWorker();
			} catch (error) {
				console.error("Failed to create new worker:", error);
				return null;
			}
		}

		return availableWorker;
	}

	private processNextTask(): void {
		if (this.taskQueue.length === 0) return;

		const availableWorker = this.getAvailableWorker();
		if (!availableWorker) return;

		const task = this.taskQueue.shift();
		if (task) {
			this.executeTask(availableWorker, task);
		}
	}

	private executeTask(poolWorker: PoolWorker, task: WorkerTask<unknown, unknown>): void {
		poolWorker.busy = true;
		poolWorker.lastUsed = Date.now();
		poolWorker.currentTask = task;

		const messageHandler = (result: unknown) => {
			this.handleWorkerMessage(poolWorker, result, task);
			cleanup();
		};

		const errorHandler = (error: Error) => {
			task.reject(error);
			this.handleWorkerError(poolWorker, error);
			cleanup();
		};

		const cleanup = () => {
			poolWorker.worker.off("message", messageHandler);
			poolWorker.worker.off("error", errorHandler);
		};

		poolWorker.worker.once("message", messageHandler);
		poolWorker.worker.once("error", errorHandler);

		poolWorker.worker.postMessage(task.data);
	}

	public async runTask<T = unknown, R = unknown>(data: T): Promise<R> {
		return new Promise((resolve, reject) => {
			const processTask = async () => {
				const task: WorkerTask<T, R> = {
					id: `task-${Date.now()}-${Math.random()}`,
					data,
					resolve,
					reject,
					timestamp: Date.now()
				};

				const availableWorker = await this.ensureWorkerAvailable();

				if (availableWorker) {
					// Execute immediately
					this.executeTask(availableWorker, task as WorkerTask<unknown, unknown>);
				} else {
					// Queue the task
					this.taskQueue.push(task as WorkerTask<unknown, unknown>);
				}
			};

			processTask().catch(reject);
		});
	}

	private startCleanupInterval(): void {
		this.cleanupInterval = setInterval(() => {
			this.cleanupIdleWorkers();
		}, 60000);
	}

	private cleanupIdleWorkers(): void {
		const now = Date.now();
		const workersToRemove: PoolWorker[] = [];

		for (const worker of this.workers) {
			const idleTime = now - worker.lastUsed;
			const isIdle = !worker.busy && idleTime > this.maxIdleTime;
			const canRemove = this.workers.length > this.minWorkers;

			if (isIdle && canRemove) {
				workersToRemove.push(worker);
			}
		}

		workersToRemove.forEach(worker => {
			this.removeWorker(worker);
		});

		if (workersToRemove.length > 0) {
			this.emit("workersCleanedUp", workersToRemove.length);
		}
	}

	public getStats() {
		return {
			totalWorkers: this.workers.length,
			busyWorkers: this.workers.filter(w => w.busy).length,
			idleWorkers: this.workers.filter(w => !w.busy).length,
			queuedTasks: this.taskQueue.length,
			maxWorkers: this.maxWorkers,
			minWorkers: this.minWorkers
		};
	}

	public async terminate(): Promise<void> {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
		}

		// Reject all queued tasks
		this.taskQueue.forEach(task => {
			task.reject(new Error("Worker pool is shutting down"));
		});
		this.taskQueue = [];

		// Terminate all workers
		const terminationPromises = this.workers.map(worker => worker.worker.terminate());

		await Promise.all(terminationPromises);
		this.workers = [];
		this.emit("poolTerminated");
	}
}
