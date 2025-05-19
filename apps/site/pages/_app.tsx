import { AppRouter, withTranslations } from "@self-learning/api";
import { Footer, Navbar } from "@self-learning/ui/layouts";
import { httpBatchLink } from "@trpc/client";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { withTRPC } from "@trpc/next";
import "katex/dist/katex.css";
import { SessionProvider } from "next-auth/react";
import PlausibleProvider from "next-plausible";
import { AppProps } from "next/app";
import Head from "next/head";
import superjson from "superjson";
import { GlobalFeatures } from "../../_features";
import "./styles.css";
import { appWithTranslation } from "next-i18next";
import Link from "next/link";

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
			transformer: superjson,
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
})(appWithTranslation(CustomApp));

function CustomApp({ Component, pageProps }: AppProps) {
	const Layout = (Component as any).getLayout
		? (Component as any).getLayout(Component, pageProps)
		: null;

	const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

	return (
		<>
			{process.env.NODE_ENV === "development" && (
				<script src="https://unpkg.com/react-scan/dist/auto.global.js" async />
			)}
			<PlausibleProvider
				domain={process.env.NEXT_PUBLIC_PLAUSIBLE_OWN_DOMAIN ?? ""}
				customDomain={process.env.NEXT_PUBLIC_PLAUSIBLE_CUSTOM_INSTANCE}
				trackLocalhost={process.env.NODE_ENV === "development"}
			>
				<SessionProvider session={pageProps.session} basePath={basePath + "/api/auth"}>
					<Head>
						<title>Self-Learning</title>
						{/* Favicon setup based on recommendation of:
						 *  - https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
						 *  - https://favicon.io/
						 */}
						<link
							rel="apple-touch-icon"
							sizes="180x180"
							href={basePath + "/apple-touch-icon.png"}
						/>
						<link rel="icon" sizes="48x48" href={basePath + "/favicon.ico"} />
						<link rel="icon" type="image/svg+xml" href={basePath + "/icon.svg"} />
						<link
							rel="icon"
							type="image/png"
							sizes="32x32"
							href={basePath + "/favicon-32x32.png"}
						/>
						<link
							rel="icon"
							type="image/png"
							sizes="16x16"
							href={basePath + "favicon-16x16.png"}
						/>
						{/* Only required for /pages, /app will handle this automatically */}
						<link rel="manifest" href={basePath + "/api/manifest"} />
					</Head>
					<GlobalFeatures />
					<Navbar />
					<main className="grid grow">
						{Layout ? <>{Layout}</> : <Component {...pageProps} />}
					</main>
					<Footer />
				</SessionProvider>
			</PlausibleProvider>
		</>
	);
}

export const getServerSideProps = withTranslations(["common"]);
