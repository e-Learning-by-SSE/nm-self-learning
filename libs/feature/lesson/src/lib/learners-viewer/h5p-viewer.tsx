import { useEffect, useRef } from "react";

interface H5PViewerProps {
	folderUrl: string;
}

declare global {
	interface Window {
		H5PStandalone?: {
			H5P: new (element: HTMLElement, options: object) => void;
		};
	}
}

export function H5PViewer({ folderUrl }: H5PViewerProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const initializedRef = useRef(false);

	useEffect(() => {
		if (!folderUrl) return;
		if (initializedRef.current) return;
		initializedRef.current = true;

		const url = new URL(folderUrl);
		const pathWithoutBucket = url.pathname.replace(/^\/[^/]+\//, "");
		const proxyPath = `/api/h5p-content/${pathWithoutBucket}`;

		function initH5P() {
			const container = containerRef.current;
			if (!container) return;
			container.innerHTML = "";

			const H5PStandalone = (
				window as unknown as {
					H5PStandalone: { H5P: new (el: HTMLElement, opts: object) => void };
				}
			).H5PStandalone;
			if (!H5PStandalone) return;

			new H5PStandalone.H5P(container, {
				h5pJsonPath: proxyPath,
				frameJs: "/h5p/frame.bundle.js",
				frameCss: "/h5p/styles/h5p.css"
			});
		}

		if (!(window as unknown as { H5PStandalone?: unknown }).H5PStandalone) {
			const script = document.createElement("script");
			script.src = "/h5p/main.bundle.js";
			script.onload = initH5P;
			document.head.appendChild(script);
		} else {
			initH5P();
		}
	}, [folderUrl]);

	return (
		<div
			ref={containerRef}
			className="w-full"
			style={{ minHeight: "500px" }}
		/>
	);
}