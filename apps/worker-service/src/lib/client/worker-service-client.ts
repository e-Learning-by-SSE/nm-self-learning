import { createTRPCProxyClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import type { AppRouter } from "../../router";

const wsClient =
	typeof window !== "undefined"
		? new WebSocket(
				process.env["NEXT_PUBLIC_WORKER_SERVICE_WS_URL"] || "ws://localhost:4510/trpc"
			)
		: null;

export const workerServiceClient = createTRPCProxyClient<AppRouter>({
	links: [
		splitLink({
			condition(op) {
				return op.type === "subscription";
			},
			true: wsLink({
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				client: wsClient as any
			}),
			false: httpBatchLink({
				url: process.env["WORKER_SERVICE_URL"] || "http://localhost:4510",
				headers: () => {
					return {
						"x-api-key": process.env["WORKER_SERVICE_SECRET"]
					};
				}
			})
		})
	]
});
