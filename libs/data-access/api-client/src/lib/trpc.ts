import { createTRPCNext } from "@trpc/next";
import { AppRouter } from "@self-learning/api";
import superjson from "superjson";
import { httpBatchLink, httpSubscriptionLink, splitLink } from "@trpc/client";

function getBaseUrl() {
	if (typeof window !== "undefined")
		// browser should use relative path
		return "";

	// assume localhost
	return `http://localhost:${process.env["PORT"] ?? 4200}`;
}

export const trpc = createTRPCNext<AppRouter>({
	// https://trpc.io/docs/useContext#invalidate-full-cache-on-every-mutation
	transformer: superjson,
	overrides: {
		useMutation: {
			/**
			 * This function is called whenever a `.useMutation` succeeds
			 **/
			async onSuccess(opts) {
				/**
				 * @note that order here matters:
				 * The order here allows route changes in `onSuccess` without
				 * having a flash of content change whilst redirecting.
				 **/
				// Calls the `onSuccess` defined in the `useQuery()`-options:
				await opts.originalFn();
				// Invalidate all queries in the react-query cache:
				await opts.queryClient.invalidateQueries();
			}
		}
	},
	config() {
		const url = `${getBaseUrl()}/api/trpc`;

		return {
			links: [
				splitLink({
					condition(op) {
						return op.type === "subscription";
					},
					true: httpSubscriptionLink({
						url: url,
						transformer: superjson
					}),
					false: httpBatchLink({
						url: url,
						transformer: superjson
					})
				})
			],
			// url: url,
			queryClientConfig: {
				defaultOptions: {
					queries: {
						staleTime: Infinity,
						retry: false,
						refetchOnWindowFocus: false
					}
				}
			}
		};
	}
});
