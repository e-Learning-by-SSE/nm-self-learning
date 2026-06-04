import { JobNotFoundError, JobValidationError } from "./errors";
import { Worker } from "worker_threads";
import * as path from "path";
import { jobEvents } from "../../event-bus";
import { existsSync } from "fs";
import { JobContext, JobRunner } from "@self-learning/worker-api";
import { JobRegistry } from "../../jobs";

interface WorkerHostOptions {
	minThreads?: number;
	maxThreads?: number;
}

interface JobRequest {
	id: string;
	name: string;
	payload: unknown;
	resolve: (value: unknown) => void;
	reject: (reason?: unknown) => void;
}

interface PendingJob {
	resolve: (value: unknown) => void;
	reject: (reason?: unknown) => void;
	timeout: NodeJS.Timeout;
}

export class WorkerHost implements JobRunner {
	private minThreads: number;
	private maxThreads: number;
	private workers: Worker[] = [];
	private idleWorkers: Worker[] = [];
	private queue: JobRequest[] = [];
	private pendingJobs = new Map<string, PendingJob>();
	private isShuttingDown = false;

	constructor(
		private jobs: JobRegistry,
		options: WorkerHostOptions = {}
	) {
		this.minThreads = Math.max(1, options.minThreads ?? 2);
		const requestedMax = options.maxThreads ?? 6;
		this.maxThreads = Math.max(this.minThreads, requestedMax);
		this.initializePool();
	}

	private initializePool() {
		for (let i = 0; i < this.minThreads; i++) {
			this.createWorker();
		}
	}

	private createWorker(): Worker {
		const { filePath, execArgv, env } = this.resolveWorkerEntry();

		const worker = new Worker(filePath, {
			execArgv,
			env
		});

		worker.on("message", message => this.handleWorkerMessage(worker, message));
		worker.on("error", err => this.handleWorkerError(worker, err));
		worker.on("exit", code => this.handleWorkerExit(worker, code));

		this.workers.push(worker);
		this.idleWorkers.push(worker);

		return worker;
	}

	private handleWorkerMessage(
		worker: Worker,
		message: { id: string; result?: unknown; error?: string }
	) {
		const { id, result, error } = message;
		const pending = this.pendingJobs.get(id);

		if (pending) {
			clearTimeout(pending.timeout);
			this.pendingJobs.delete(id);

			if (error) {
				pending.reject(new Error(error));
			} else {
				pending.resolve(result);
			}
		}

		this.makeWorkerIdle(worker);
	}

	private handleWorkerError(worker: Worker, error: Error) {
		console.error("Worker error:", error);
		this.terminateWorker(worker);
		if (!this.isShuttingDown) {
			this.replaceWorkerIfNeeded();
		}
	}

	private handleWorkerExit(worker: Worker, code: number) {
		if (code !== 0 && !this.isShuttingDown) {
			console.error(`Worker stopped with exit code ${code}`);
		}
		this.removeWorker(worker);
		if (!this.isShuttingDown) {
			this.replaceWorkerIfNeeded();
		}
	}

	private makeWorkerIdle(worker: Worker) {
		if (!this.workers.includes(worker)) return;
		this.idleWorkers.push(worker);
		if (!this.isShuttingDown) {
			this.processQueue();
		}
	}

	private removeWorker(worker: Worker) {
		const idx = this.workers.indexOf(worker);
		if (idx > -1) this.workers.splice(idx, 1);

		const idleIdx = this.idleWorkers.indexOf(worker);
		if (idleIdx > -1) this.idleWorkers.splice(idleIdx, 1);
	}

	private terminateWorker(worker: Worker) {
		worker.terminate();
		this.removeWorker(worker);
	}

	private replaceWorkerIfNeeded() {
		if (this.isShuttingDown) return;
		if (this.workers.length < this.minThreads) {
			this.createWorker();
			this.processQueue();
		}
	}

	async runJob<TResult>(
		jobId: string,
		name: string,
		payload: unknown,
		_context: JobContext = {}
	): Promise<{ result: TResult; duration: number }> {
		const job = this.jobs[name];

		if (!job) {
			throw new JobNotFoundError(`Job '${name}' not found`);
		}

		let validatedPayload = payload;

		if (job.schema) {
			const result = job.schema.safeParse(payload);
			if (!result.success) {
				throw new JobValidationError("Invalid payload", result.error.issues);
			}
			validatedPayload = result.data;
		}

		const startTime = Date.now();

		const result = await new Promise((resolve, reject) => {
			this.queue.push({ id: jobId, name, payload: validatedPayload, resolve, reject });
			this.processQueue();
		});

		const duration = Date.now() - startTime;

		return {
			result: result as TResult,
			duration
		};
	}

	private processQueue() {
		if (this.isShuttingDown) {
			return;
		}
		if (this.queue.length === 0) return;

		let worker: Worker | undefined;

		if (this.idleWorkers.length > 0) {
			worker = this.idleWorkers.shift();
		} else if (this.workers.length < this.maxThreads) {
			worker = this.createWorker();
			// Newly created worker is added to idleWorkers in createWorker
			// We need to take it out immediately
			this.idleWorkers.pop();
		}

		if (worker) {
			const job = this.queue.shift();
			if (job) {
				this.executeJob(worker, job);
			} else {
				// Should not happen, but put worker back if queue is empty
				this.idleWorkers.push(worker);
			}
		}
	}

	private executeJob(worker: Worker, job: JobRequest) {
		if (this.isShuttingDown) {
			return;
		}
		jobEvents.emitJobEvent(job.id, { status: "started", type: job.name });
		const timeout = setTimeout(() => {
			const pending = this.pendingJobs.get(job.id);
			if (pending) {
				pending.reject(new Error("Job timed out after 30 seconds"));
				this.pendingJobs.delete(job.id);
				this.terminateWorker(worker); // Kill the stuck worker
				this.replaceWorkerIfNeeded(); // Start a new one
			}
		}, 30000);

		this.pendingJobs.set(job.id, {
			resolve: job.resolve,
			reject: job.reject,
			timeout
		});

		worker.postMessage({ id: job.id, jobName: job.name, payload: job.payload });
	}

	private resolveWorkerEntry() {
		const nearMain = path.join(__dirname, "./worker-runner.js");
		if (existsSync(nearMain)) {
			return { filePath: nearMain, execArgv: undefined, env: undefined };
		}

		// Fallback for execution in dist (i.e., Jest/ts-node)
		const distWorker = path.resolve(process.cwd(), "dist/apps/worker-service/worker-runner.js");
		if (existsSync(distWorker)) {
			return { filePath: distWorker, execArgv: undefined, env: undefined };
		}

		throw new Error(
			`worker-runner.js not found. Tried:\n- ${nearMain}\n- ${distWorker}\nDid you run "nx build worker-service"?`
		);
	}

	public async shutdown(): Promise<void> {
		this.isShuttingDown = true;
		this.queue = [];
		for (const pending of this.pendingJobs.values()) {
			clearTimeout(pending.timeout);
			pending.reject(new Error("WorkerHost shutdown"));
		}
		this.pendingJobs.clear();
		await Promise.all(this.workers.map(worker => worker.terminate()));
		this.workers = [];
		this.idleWorkers = [];
	}
}
