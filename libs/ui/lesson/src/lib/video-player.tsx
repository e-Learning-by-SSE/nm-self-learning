import { trpc } from "@self-learning/api-client";
import {
	loadFromStorage,
	gatherLearningActivity,
	saveToStorage
} from "@self-learning/learning-analytics";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export function VideoPlayer({ url }: Readonly<{ url: string }>) {
	//Learning Analytics: init or save video info
	const { mutateAsync: createLearningAnalytics } = trpc.learningAnalytics.create.useMutation();
	const { mutateAsync: createLASession } = trpc.learningAnalytics.createSession.useMutation();

	useEffect(() => {
		const videoInfos = loadFromStorage("la_videoInfo");
		if (!videoInfos)
			saveToStorage("la_videoInfo", {
				videoStart: null,
				videoEnd: null,
				videoBreaks: 0,
				videoSpeed: 1
			});
	}, []);

	async function onStart() {
		const videoInfo = loadFromStorage("la_videoInfo");
		if (videoInfo) {
			const data = gatherLearningActivity();
			if (data) {
				try {
					if (data.id) {
						const laSession = loadFromStorage("la_lessonInfo");
						if (laSession) {
							const session = await createLASession({
								start: new Date(laSession.lessonStart).toISOString(),
								end: laSession?.lessonEnd?.toISOString() ?? null
							});
							laSession.id = session.id;
							saveToStorage("la_sessionInfo", laSession);
							data.sessionId = session.id;
							await createLearningAnalytics(data);
						}
					} else {
						await createLearningAnalytics(data);
					}
				} catch (e) {
					console.log("Error saving learning analytics from VideoPlayer.", e);
				}
			}
		}
		saveToStorage("la_videoInfo", {
			videoStart: new Date(),
			videoEnd: null,
			videoBreaks: 0,
			videoSpeed: 1
		});
	}

	function onPause() {
		const videoInfo = loadFromStorage("la_videoInfo");
		if (videoInfo?.videoBreaks) {
			videoInfo.videoBreaks++;
			saveToStorage("la_videoInfo", videoInfo);
		}
	}

	function onEnded() {
		const videoInfo = loadFromStorage("la_videoInfo");
		if (videoInfo) {
			videoInfo.videoEnd = new Date();
			saveToStorage("la_videoInfo", videoInfo);
		}
	}

	function onPlaybackRateChange(e: number) {
		const videoInfo = loadFromStorage("la_videoInfo");
		if (videoInfo?.videoSpeed) {
			videoInfo.videoSpeed = e;
			saveToStorage("la_videoInfo", videoInfo);
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
