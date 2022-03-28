import { AppProps } from "next/app";
import Head from "next/head";
import "./styles.css";

function CustomApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>Self-Learning</title>
			</Head>
			<main className="min-h-screen h-screen bg-gray-800 text-white">
				<Component {...pageProps} />
			</main>
		</>
	);
}

export default CustomApp;
