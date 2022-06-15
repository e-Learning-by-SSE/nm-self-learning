import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export function VideoPlayer({ url }: { url: string }) {
	return <ReactPlayer url={url} height="100%" width="100%" controls={true} />;
}
