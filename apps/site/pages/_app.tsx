import { type AppRouter } from "@self-learning/api";
import { Navbar, Footer, MessagePortal } from "@self-learning/ui/layouts";
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
import { trpc } from "@self-learning/api-client";
import { format, parseISO } from "date-fns";
import { resetLASession, saveLA } from "@self-learning/learning-analytics";

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
	const { mutateAsync: createLASession } = trpc.learningAnalytics.createSession.useMutation();
	const { mutateAsync: setEndOfSession } = trpc.learningAnalytics.setEndOfSession.useMutation();
	const { mutateAsync: createLearningAnalytics } =
		trpc.learningAnalytics.createLearningAnalytics.useMutation();

	useEffect(() => {
		const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
		const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
		if (MATOMO_URL && MATOMO_SITE_ID) {
			init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID, excludeUrlsPatterns: [/\/api\//] });
		}
	}, []);

	// Learning Analytics: Session handling
	useEffect(() => {
		const handleClose = () => {
			const laSession = JSON.parse(localStorage.getItem("la_session") + "");
			if (laSession && laSession !== "" && laSession.start) {
				laSession.end = "" + new Date();
				window.localStorage.setItem("la_session", JSON.stringify(laSession));
			}
		};

		window.addEventListener("unload", handleClose, false);
		return () => {
			window.removeEventListener("unload", handleClose);
		};
	}, [createLearningAnalytics, setEndOfSession]);

	useEffect(() => {
		const laSession = JSON.parse(localStorage.getItem("la_session") + "");
		const start = laSession
			? format(parseISO(new Date(laSession.start).toISOString()), "dd.MM.yyyy")
			: "";
		const today = format(parseISO(new Date().toISOString()), "dd.MM.yyyy");
		if (!(laSession && laSession !== "")) {
			let id = -1;
			createLASession()
				.then((promise: { id: number }) => {
					id = promise.id;
					window.localStorage.setItem(
						"la_session",
						JSON.stringify({ start: "" + new Date(), end: "", id: id })
					);
				})
				.catch(e => {
					console.error(e);
				});
		} else if (laSession.start != "" && laSession.end != "" && start != today) {
			const data = saveLA();
			if (data) {
				createLearningAnalytics(data);
			}
			const date = new Date();
			const isoDateTime = new Date(
				date.getTime() - date.getTimezoneOffset() * 60000
			).toISOString();
			setEndOfSession({ end: isoDateTime, id: laSession.id }).then(() => resetLASession());
		}
	}, [createLASession, createLearningAnalytics, setEndOfSession]);

	return (
		<PlausibleProvider
			domain={process.env.NEXT_PUBLIC_PLAUSIBLE_OWN_DOMAIN ?? ""}
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
				<MessagePortal />
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
