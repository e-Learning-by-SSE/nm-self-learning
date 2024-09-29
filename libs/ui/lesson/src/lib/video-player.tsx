import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export function VideoPlayer({
	url,
	subtitle
}: {
	url: string;
	subtitle?: {
		src: string;
		label: string;
		srcLang: string;
	};
}) {
	const subtitleUrl = useMemo(() => {
		if (subtitle && subtitle.src) {
			const blob = new Blob([subtitle.src], { type: "text/vtt" });
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
			controls={true}
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
