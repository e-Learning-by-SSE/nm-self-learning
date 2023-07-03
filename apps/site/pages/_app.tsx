import type { AppRouter } from "@self-learning/api";
import { Navbar, Footer } from "@self-learning/ui/layouts";
import { httpBatchLink } from "@trpc/client";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { withTRPC } from "@trpc/next";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
// import { ReactQueryDevtools } from "react-query/devtools";
import "./styles.css";
import "katex/dist/katex.css";
import { useEffect } from "react";
import { init } from "@socialgouv/matomo-next";
import PlausibleProvider from "next-plausible";

export default withTRPC<AppRouter>({
	config() {
		return {
			links: [
				loggerLink({
					enabled: opts =>
						process.env.NODE_ENV === "development" ||
						(opts.direction === "down" && opts.result instanceof Error)
				}),
				httpBatchLink({
					url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/trpc`
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

	useEffect(() => {
		const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
		const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
		if (MATOMO_URL && MATOMO_SITE_ID) {
			init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID, excludeUrlsPatterns: [/\/api\//] });
		}
	}, []);

	return (
		<PlausibleProvider
			domain={process.env.NEXT_PUBLIC_PLAUSIBLE_OWN_DOMAIN ?? "dev.testing.com"}
			customDomain={process.env.NEXT_PUBLIC_PLAUSIBLE_CUSTOM_INSTANCE}
			trackLocalhost={process.env.NODE_ENV === "development" ? true : false}
		>
			<SessionProvider
				session={pageProps.session}
				basePath={useRouter().basePath + "/api/auth"}
			>
				<Head>
					<title>Self-Learning</title>
				</Head>
				<Navbar />
				<main className="grid grow">
					{Layout ? <>{Layout}</> : <Component {...pageProps} />}
				</main>
				<Toaster containerStyle={{ top: 96 }} position="top-right" />
				<Footer />
				{/* <ReactQueryDevtools position="bottom-right" /> */}
			</SessionProvider>
		</PlausibleProvider>
	);
}
