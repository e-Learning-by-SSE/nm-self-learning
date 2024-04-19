import { trpc } from "@self-learning/api-client";
import {
	SessionInfoType,
	StorageKeys,
	VideoInfoType,
	checkUndefined,
	loadFromStorage,
	parseDateToISOString,
	saveLA,
	saveToStorage
} from "@self-learning/learning-analytics";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export function VideoPlayer({ url }: Readonly<{ url: string }>) {
	//Learning Analytics: init or save video info
	const { mutateAsync: createLearningAnalytics } =
		trpc.learningAnalytics.createLearningAnalytics.useMutation();
	const { mutateAsync: createLASession } = trpc.learningAnalytics.createSession.useMutation();

	useEffect(() => {
		const videoInfos = loadFromStorage<VideoInfoType>(StorageKeys.LAVideo);
		if (videoInfos == null)
			saveToStorage<VideoInfoType>(StorageKeys.LAVideo, {
				videoStart: null,
				videoEnd: null,
				videoBreaks: 0,
				videoSpeed: 1
			});
	}, []);

	async function onStart() {
		const videoInfo = loadFromStorage<VideoInfoType>(StorageKeys.LAVideo);
		if (videoInfo) {
			const data = saveLA();
			if (data) {
				try {
					if (data.sessionId < 0) {
						const laSession = loadFromStorage<SessionInfoType>(StorageKeys.LALesson);
						if (laSession) {
							const session = await createLASession({
								start: new Date(laSession.start).toISOString(),
								end: parseDateToISOString(laSession?.end)
							});
							laSession.id = session.id;
							saveToStorage<SessionInfoType>(StorageKeys.LASession, laSession);
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
		saveToStorage<VideoInfoType>(StorageKeys.LAVideo, {
			videoStart: new Date(),
			videoEnd: null,
			videoBreaks: 0,
			videoSpeed: 1
		});
	}

	function onPause() {
		const videoInfo = loadFromStorage<VideoInfoType>(StorageKeys.LAVideo);
		if (videoInfo?.videoBreaks != null) {
			videoInfo.videoBreaks++;
			saveToStorage<VideoInfoType>(StorageKeys.LAVideo, videoInfo);
		}
	}

	function onEnded() {
		const videoInfo = loadFromStorage<VideoInfoType>(StorageKeys.LAVideo);
		if (videoInfo) {
			videoInfo.videoEnd = new Date();
			saveToStorage<VideoInfoType>(StorageKeys.LAVideo, videoInfo);
		}
	}

	function onPlaybackRateChange(e: any) {
		const videoInfo = loadFromStorage<VideoInfoType>(StorageKeys.LAVideo);
		if (videoInfo?.videoSpeed != null) {
			videoInfo.videoSpeed = e;
			saveToStorage<VideoInfoType>(StorageKeys.LAVideo, videoInfo);
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
