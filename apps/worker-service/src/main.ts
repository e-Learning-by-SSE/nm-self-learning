import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { WorkerHost } from "./lib/core/worker-host";
import { jobs } from "./jobs";
import { appRouter } from "./router";

const workerHost = new WorkerHost(jobs);

const port = 4510;

const handler = createHTTPHandler({
	router: appRouter,
	createContext: _opts => ({
		workerHost
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

	handler(req, res);
});

// WebSocket Server
const wss = new WebSocketServer({ server });
applyWSSHandler({
	wss,
	router: appRouter,
	createContext: () => ({
		workerHost
	})
});

server.listen(port, () => {
	console.log(`Worker service listening on port ${port}`);
});
