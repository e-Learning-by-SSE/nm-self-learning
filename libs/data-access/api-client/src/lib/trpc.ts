import { createTRPCNext } from "@trpc/next";
import { AppRouter } from "@self-learning/api";

function getBaseUrl() {
	if (typeof window !== "undefined")
		// browser should use relative path
		return "";

	// assume localhost
	return `http://localhost:${process.env.PORT ?? 4200}`;
}

export const trpc = createTRPCNext<AppRouter>({
	config() {
		return {
			links: [],
			url: `${getBaseUrl()}/api/trpc`,
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
