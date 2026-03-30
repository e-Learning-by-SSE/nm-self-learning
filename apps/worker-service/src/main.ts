import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { WorkerHost } from "./lib/core/worker-host";
import { jobs } from "./jobs";
import { appRouter } from "@self-learning/worker-api";
import { jobEvents } from "./event-bus";

const workerHost = new WorkerHost(jobs);

const port = 4510;
const TRPC_PREFIX = "/trpc";

const handler = createHTTPHandler({
	router: appRouter,
	createContext: _opts => ({
		workerHost,
		events: jobEvents
	})
});

const server = createServer((req, res) => {
	// res.setHeader("Access-Control-Allow-Origin", "*");
	// ...

	if (req.method === "OPTIONS") {
		// res.writeHead(200);
		// res.end();
		return;
	}
	if (!req.url?.startsWith(TRPC_PREFIX)) {
		res.statusCode = 404;
		res.end("Not Found");
		return;
	}

	// ✅ strip "/trpc" so tRPC sees "/reverse?batch=1"
	req.url = req.url.slice(TRPC_PREFIX.length) || "/";

	return handler(req, res);
});

// WebSocket Server
const wss = new WebSocketServer({ server });
applyWSSHandler({
	wss,
	router: appRouter,
	createContext: () => ({
		workerHost,
		events: jobEvents
	})
});

server.listen(port, () => {
	console.log(`Worker service listening on port ${port}`);
});
