import {
	createTRPCProxyClient,
	httpBatchLink,
	splitLink,
	wsLink,
	createWSClient
} from "@trpc/client";
import superjson from "superjson";
// import type { AppRouter as WorkerRouter } from "../../router"; // B's router TYPE (type-only!)

const httpUrl = process.env.WORKER_SERVICE_URL ?? "http://localhost:4510/trpc";
const wsUrl = process.env.WORKER_SERVICE_WS_URL ?? "ws://localhost:4510/trpc";

const wsClient = createWSClient({ url: wsUrl });

export const workerServiceClient = createTRPCProxyClient<any>({
	// transformer: superjson,
	links: [
		splitLink({
			condition(op) {
				return op.type === "subscription";
			},
			true: wsLink({
				client: wsClient
				// transformer: superjson
			}),
			false: httpBatchLink({
				url: httpUrl,
				headers: () => ({
					"x-api-key": process.env.WORKER_SERVICE_SECRET ?? ""
				})
			})
		})
	]
});
