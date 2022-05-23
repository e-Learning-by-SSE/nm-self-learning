import { Navbar } from "@self-learning/ui/layouts";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "react-query";
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
	return (
		<>
			<SessionProvider session={pageProps.session}>
				<QueryClientProvider client={queryClient}>
					<Head>
						<title>Self-Learning</title>
					</Head>
					<Navbar />
					<main className="grid grow">
						<Component {...pageProps} />
					</main>
					{/* <ReactQueryDevtools initialIsOpen={false} position="bottom-right" /> */}
				</QueryClientProvider>
			</SessionProvider>
		</>
	);
}

export default CustomApp;
