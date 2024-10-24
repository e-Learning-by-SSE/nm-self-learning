import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export function VideoPlayer({
	url,
	subtitle,
	onProgress,
	ref,
}: {
	url: string;
	subtitle?: {
		src: string;
		label: string;
		srcLang: string;
	};
	onProgress?: (progress: number) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	ref?: React.MutableRefObject<any>;
}) {
	const subtitleUrl = useMemo(() => {
		if (subtitle && subtitle.src) {
			const blob = new Blob([subtitle.src], { type: "text/vtt;charset=utf-8" });
			return URL.createObjectURL(blob);
		}
		return null;
	}, [subtitle]);


	if (!subtitleUrl) {
		return <ReactPlayer url={url} height="100%" width="100%" controls={true} />;
	}

	return (
		<ReactPlayer
			url={url}
			height="100%"
			width="100%"
			ref={ref}
			controls={true}
			onProgress={() =>{}}
			config={{
				file: {
					attributes: {
						crossOrigin: "true"
					},
					tracks: [
						{
							kind: "subtitles",
							src: subtitleUrl,
							srcLang: subtitle?.srcLang ?? "en",
							label: subtitle?.label ?? "English",
							default: true
						}
					]
				}
			}}
		/>
	);
}
