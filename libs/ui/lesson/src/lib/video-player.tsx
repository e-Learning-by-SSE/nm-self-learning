import { trpc } from "@self-learning/api-client";
import { getVideoInfo, saveLA } from "@self-learning/learning-analytics";
import dynamic from "next/dynamic";
import { SetStateAction, useEffect, useState } from "react";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export function VideoPlayer({ url }: Readonly<{ url: string }>) {
	//Learning Analytics: init or save video info

	const { mutateAsync: createLearningAnalytics } =
		trpc.learningAnalytics.createLearningAnalytics.useMutation();
	useEffect(() => {
		const videoInfos = JSON.parse(localStorage.getItem("la_videoInfo") + "");
		if (videoInfos && videoInfos !== "") {
		} else {
			window.localStorage.setItem(
				"la_videoInfo",
				JSON.stringify({ stops: 1, speed: 1, start: "", end: "" })
			);
		}
	}, []);

	function onStart() {
		const videoInfo = getVideoInfo();
		if (videoInfo && videoInfo.start !== "") {
			const data = saveLA();
			if (data) {
				createLearningAnalytics(data);
			}
		}
		window.localStorage.setItem(
			"la_videoInfo",
			JSON.stringify({ stops: 1, speed: 1, start: "" + new Date(), end: "" })
		);
	}

	function onPause() {
		const videoInfo = getVideoInfo();
		if (videoInfo) {
			videoInfo.stops++;
			window.localStorage.setItem("la_videoInfo", JSON.stringify(videoInfo));
		}
	}

	function onEnded() {
		const videoInfo = getVideoInfo();
		if (videoInfo) {
			videoInfo.end = "" + new Date();
			window.localStorage.setItem("la_videoInfo", JSON.stringify(videoInfo));
		}
	}

	function onPlaybackRateChange(e: any) {
		const videoInfo = getVideoInfo();
		if (videoInfo) {
			videoInfo.speed = e;
			window.localStorage.setItem("la_videoInfo", JSON.stringify(videoInfo));
		}
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
			loop={false}
			onPlaybackRateChange={onPlaybackRateChange}
		/>
	);
}
