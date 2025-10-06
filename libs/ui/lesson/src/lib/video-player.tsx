"use client";

import {
	useMemo,
	useCallback,
	useEffect,
	useRef,
	useState,
	forwardRef
} from "react";
import type { OnProgressProps } from "react-player/base";
import ReactPlayer from "react-player/lazy";
import { EventLog, EventTypeKeys } from "@self-learning/types";
import { useEventLog } from "@self-learning/util/common";

type SubtitleDescriptor = {
	src: string;
	label: string;
	srcLang: string;
};

type VideoPlayerProps = Readonly<{
	url: string;
	subtitle?: SubtitleDescriptor;
	onProgress?: (progress: number) => void;
	startAt?: number;
	parentLessonId?: string;
	courseId?: string;
}>;

function useHydrationFix() {
	// hydration error workaround https://github.com/cookpete/react-player/issues/1474#issuecomment-1484028123 :)
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);
	return { isClient };
}

export const VideoPlayer = forwardRef<ReactPlayer | null, VideoPlayerProps>(function VideoPlayer(
	{ url, subtitle, onProgress, startAt = 0, parentLessonId, courseId },
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	externalRef
) {
	const playerRef = useRef<ReactPlayer | null>(null);

	const subtitleUrl = useMemo(() => {
		if (subtitle?.src) {
			const blob = new Blob([subtitle.src], { type: "text/vtt;charset=utf-8" });
			return URL.createObjectURL(blob);
		}
		return null;
	}, [subtitle]);

	useEffect(() => {
		if (!subtitleUrl) return;
		return () => {
			URL.revokeObjectURL(subtitleUrl);
		};
	}, [subtitleUrl]);

	const { isClient } = useHydrationFix();
	const { newEvent: writeEvent } = useEventLog();
	const [isReady, setIsReady] = useState(false);
	const [lastRenderTime, setLastRenderTime] = useState(Date.now());

	useEffect(() => {
		setLastRenderTime(Date.now());
	}, []);

	const logEvent = useCallback(
		async <K extends EventTypeKeys>(event: EventLog<K>) => {
			if (parentLessonId) {
				await writeEvent({ ...event, resourceId: parentLessonId, courseId });
			}
		},
		[parentLessonId, writeEvent, courseId]
	);

	const handleStart = useCallback(async () => {
		await logEvent({
			type: "LESSON_VIDEO_START",
			payload: undefined
		});
	}, [logEvent]);

	const handleReady = useCallback(() => {
		if (!isReady) {
			playerRef.current?.seekTo(startAt, "seconds");
			setIsReady(true);
			void logEvent({
				type: "LESSON_VIDEO_OPENED",
				payload: { url }
			});
		}
	}, [isReady, startAt, logEvent, url]);

	const handlePlay = useCallback(() => {
		void logEvent({
			type: "LESSON_VIDEO_PLAY",
			payload: { videoCurrentTime: playerRef.current?.getCurrentTime() ?? 0, url }
		});
	}, [logEvent, url]);

	const handlePause = useCallback(() => {
		void logEvent({
			type: "LESSON_VIDEO_PAUSE",
			payload: { videoCurrentTime: playerRef.current?.getCurrentTime() ?? 0, url }
		});
	}, [logEvent, url]);

	const handleEnded = useCallback(() => {
		void logEvent({
			type: "LESSON_VIDEO_END",
			payload: { url }
		});
	}, [logEvent, url]);

	const handlePlaybackRateChange = useCallback(
		(videoSpeed: number) => {
			void logEvent({
				type: "LESSON_VIDEO_SPEED",
				payload: { videoSpeed }
			});
		},
		[logEvent]
	);

	const handleSeek = useCallback(
		(seconds: number) => {
			if (startAt === playerRef.current?.getCurrentTime()) return;
			if (Date.now() - lastRenderTime < 2000) return;
			void logEvent({
				type: "LESSON_VIDEO_JUMP",
				payload: {
					videoJump: 0,
					videoLand: seconds
				}
			});
		},
		[startAt, lastRenderTime, logEvent]
	);

	const handleProgress = useCallback(
		(state: OnProgressProps) => {
			onProgress?.(state.playedSeconds);
		},
		[onProgress]
	);

	if (!isClient) return <p>The video player cannot render on the server side</p>;

	return (
		<ReactPlayer
			data-testid="video-player"
			url={url}
			ref={playerRef}
			height="100%"
			width="100%"
			controls={true}
			onStart={handleStart}
			onPause={handlePause}
			onEnded={handleEnded}
			onPlay={handlePlay}
			onSeek={handleSeek}
			onProgress={handleProgress}
			onReady={handleReady}
			loop={false}
			onPlaybackRateChange={handlePlaybackRateChange}
			config={
				subtitleUrl
					? {
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
						}
					: undefined
			}
		/>
	);
});
