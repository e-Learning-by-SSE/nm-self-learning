import { useEffect, useRef, useState } from "react";

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
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!folderUrl) return;
		setIsLoading(true);

		let cancelled = false;

		const url = new URL(folderUrl);
		const pathWithoutBucket = url.pathname.replace(/^\/[^/]+\//, "");
		const proxyPath = `/api/h5p-content/${pathWithoutBucket}`;

		function initH5P() {
			if (cancelled) return;
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
			if (!cancelled) setIsLoading(false);
		}

		const windowWithAmd = window as unknown as { define?: { amd?: unknown } };
		const savedDefine = windowWithAmd.define;

		if (!(window as unknown as { H5PStandalone?: unknown }).H5PStandalone) {
			if (windowWithAmd.define) {
				windowWithAmd.define = undefined as unknown as typeof windowWithAmd.define;
			}
			const script = document.createElement("script");
			script.src = "/h5p/main.bundle.js";
			script.onload = () => {
				if (savedDefine !== undefined) {
					windowWithAmd.define = savedDefine;
				}
				initH5P();
			};
			document.head.appendChild(script);
		} else {
			initH5P();
		}

		return () => {
			cancelled = true;
		};
	}, [folderUrl]);

	return (
		<div className="w-full" style={{ minHeight: "500px" }}>
			{isLoading && (
				<div className="flex h-[500px] w-full items-center justify-center bg-c-surface-2 rounded">
					<div className="text-center text-c-text-muted">
						<div className="animate-spin text-3xl mb-2">
							<span role="img" aria-label="Loading">
								⏳
							</span>
						</div>
						<p className="text-sm">H5P Inhalt wird geladen...</p>
					</div>
				</div>
			)}
			<div
				ref={containerRef}
				className="w-full"
				style={{ display: isLoading ? "none" : "block" }}
			/>
		</div>
	);
}