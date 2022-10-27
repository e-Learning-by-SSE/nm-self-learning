import type { AppRouter } from "@self-learning/api";
import { Navbar } from "@self-learning/ui/layouts";
import { httpLink } from "@trpc/client/links/httpLink";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { withTRPC } from "@trpc/next";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
// import { ReactQueryDevtools } from "react-query/devtools";
import "./styles.css";

export default withTRPC<AppRouter>({
	config() {
		return {
			links: [
				loggerLink({
					enabled: opts =>
						process.env.NODE_ENV === "development" ||
						(opts.direction === "down" && opts.result instanceof Error)
				}),
				httpLink({
					url: "/api/trpc"
				})
			],
			queryClientConfig: {
				defaultOptions: {
					queries: {
						retry: false,
						staleTime: Infinity
					}
				}
			}
		};
	}
})(CustomApp);

function CustomApp({ Component, pageProps }: AppProps) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const Layout = (Component as any).getLayout
		? // eslint-disable-next-line @typescript-eslint/no-explicit-any
		  (Component as any).getLayout(Component, pageProps)
		: null;

	return (
		<SessionProvider session={(pageProps as any).session}>
			<Head>
				<title>Self-Learning</title>
			</Head>
			<Navbar />
			<main className="grid grow">
				{Layout ? <>{Layout}</> : <Component {...pageProps} />}
			</main>
			<Toaster containerStyle={{ top: 96 }} position="top-right" />
			{/* <ReactQueryDevtools position="bottom-right" /> */}
		</SessionProvider>
	);
}
