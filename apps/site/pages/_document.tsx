import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
	const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

	return (
		<Html>
			<Head>
				{/* Customizable Theme CSS */}
				<link rel="stylesheet" href={`${basePath}/theme.css`} />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
