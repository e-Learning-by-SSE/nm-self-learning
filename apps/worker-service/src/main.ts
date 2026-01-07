import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { WebSocketServer } from "ws";
import { JobRegistry } from "./lib/core/job-registry";
import { WorkerHost } from "./lib/core/worker-host";
import { registerAllJobs } from "./jobs";
import { appRouter } from "./router";

const registry = new JobRegistry();
registerAllJobs(registry);

const workerHost = new WorkerHost(registry);

const port = 4510;

// HTTP Server
const { server, listen } = createHTTPServer({
	router: appRouter,
	createContext: () => ({
		registry,
		workerHost
	})
});

// WebSocket Server
const wss = new WebSocketServer({ server });
applyWSSHandler({
	wss,
	router: appRouter,
	createContext: () => ({
		registry,
		workerHost
	})
});

listen(port);
console.log(`Worker service listening on port ${port}`);
