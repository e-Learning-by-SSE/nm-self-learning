import { AppProps } from "next/app";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
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
			<QueryClientProvider client={queryClient}>
				<Head>
					<title>Self-Learning</title>
				</Head>
				{/* <Navbar /> */}
				<main className="grid grow">
					<Component {...pageProps} />
				</main>
				<ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
			</QueryClientProvider>
		</>
	);
}

export default CustomApp;
