import dynamic from "next/dynamic";
import { SetStateAction, useEffect, useState } from "react";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export function VideoPlayer({ url }: Readonly<{ url: string }>) {
	//Learning Analytics: init or save video info
	const [videoInfo, setVideoInfo] = useState({ stops: 1, speed: 1, start: "", end: "" });
	useEffect(() => {
		const videoInfos = JSON.parse(localStorage.getItem("la_videoInfo") + "");
		if (videoInfos && videoInfos !== "") {
			setVideoInfo(videoInfos);
		} else {
			window.localStorage.setItem(
				"la_videoInfo",
				JSON.stringify({ stops: 1, speed: 1, start: "", end: "" })
			);
		}
	}, []);

	function changeVideoInfo(
		changeVideoInfo: SetStateAction<{
			stops: number;
			speed: number;
			start: string;
			end: string;
		}>
	) {
		setVideoInfo(changeVideoInfo);
		if (window !== undefined) {
			window.localStorage.setItem("la_videoInfo", JSON.stringify(videoInfo));
		}
	}

	function onStart() {
		changeVideoInfo(videoInfo => ({
			...videoInfo,
			start: "" + new Date()
		}));
	}

	function onPause() {
		changeVideoInfo(videoInfo => ({
			...videoInfo,
			stops: videoInfo.stops + 1
		}));
	}

	function onEnded() {
		changeVideoInfo(videoInfo => ({
			...videoInfo,
			end: "" + new Date()
		}));
	}

	function onPlaybackRateChange(e: any) {
		changeVideoInfo(videoInfo => ({
			...videoInfo,
			speed: e
		}));
	}
	//Learning Analytics: end

	return (
		<ReactPlayer
			url={url}
			height="100%"
			width="100%"
			controls={true}
			onStart={onStart}
			onPause={onPause}
			onEnded={onEnded}
			onPlaybackRateChange={onPlaybackRateChange}
		/>
	);
}
