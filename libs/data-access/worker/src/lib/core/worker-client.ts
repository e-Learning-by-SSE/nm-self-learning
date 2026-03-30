import {
	createTRPCProxyClient,
	httpBatchLink,
	splitLink,
	wsLink,
	createWSClient
} from "@trpc/client";
import { WorkerAppRouterType } from "./router";

const httpUrl = process.env.WORKER_SERVICE_URL ?? "http://localhost:4510/trpc";
const wsUrl = process.env.WORKER_SERVICE_WS_URL ?? "ws://localhost:4510/trpc";

const wsClient = createWSClient({ url: wsUrl });

/**
 * The tRPC client of site to communicate with the worker-service.
 */
export const workerServiceClient = createTRPCProxyClient<WorkerAppRouterType>({
	links: [
		splitLink({
			condition(op) {
				return op.type === "subscription";
			},
			true: wsLink({
				client: wsClient
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
