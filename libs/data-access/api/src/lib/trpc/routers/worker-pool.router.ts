import { t } from "../trpc";
import { workerPoolManager } from "../workers/worker-pool-manager";

export const workerPoolRouter = t.router({
	stats: t.procedure.query(() => {
		return workerPoolManager.getStats();
	})
});
