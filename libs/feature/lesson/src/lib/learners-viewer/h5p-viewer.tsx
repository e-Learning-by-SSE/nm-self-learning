import { useEffect, useRef } from "react";

interface H5PViewerProps {
	folderUrl: string;
}

export function H5PViewer({ folderUrl }: H5PViewerProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!folderUrl) return;

		let initialized = false;

		const url = new URL(folderUrl);
		const pathWithoutBucket = url.pathname.replace(/^\/[^/]+\//, "");
		const proxyPath = `/api/h5p-content/${pathWithoutBucket}`;

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		import("h5p-standalone").then(({ H5P: H5PStandalone }) => {
			const container = containerRef.current;
			if (!container) return;
			if (initialized) return;
			initialized = true;
			container.innerHTML = "";
			new H5PStandalone(container, {
				h5pJsonPath: proxyPath,
				frameJs: "/h5p/frame.bundle.js",
				frameCss: "/h5p/styles/h5p.css"
			});
		});

		return () => {
			initialized = true;
		};
	}, [folderUrl]);

	return (
		<div
			ref={containerRef}
			className="w-full"
			style={{ minHeight: "500px" }}
		/>
	);
}