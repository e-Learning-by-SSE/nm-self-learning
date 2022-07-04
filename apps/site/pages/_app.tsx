import { Navbar } from "@self-learning/ui/layouts";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Toaster } from "react-hot-toast";
import "./styles.css";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Infinity,
			retry: false
		}
	}
});

function CustomApp({ Component, pageProps }: AppProps) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const Layout = (Component as any).getLayout
		? // eslint-disable-next-line @typescript-eslint/no-explicit-any
		  (Component as any).getLayout(Component, pageProps)
		: null;

	return (
		<>
			<SessionProvider session={pageProps.session}>
				<QueryClientProvider client={queryClient}>
					<Head>
						<title>Self-Learning</title>
					</Head>
					<Navbar />
					<main className="mt-14 grid grow sm:mt-20">
						{Layout ? <>{Layout}</> : <Component {...pageProps} />}
					</main>
					<Toaster containerStyle={{ top: 96 }} position="top-right" />
					<ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
				</QueryClientProvider>
			</SessionProvider>
		</>
	);
}

export default CustomApp;
