"use client";

import { EventLog, EventTypeKeys } from "@self-learning/types";
import { useEventLog } from "@self-learning/util/common";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player/lazy";

function useHydrationFix() {
	// hydration error workaround https://github.com/cookpete/react-player/issues/1474#issuecomment-1484028123 :)
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);
	return { isClient };
}

export function VideoPlayer({
	url,
	startAt = 0,
	parentLessonId
}: Readonly<{ url: string; startAt?: number; parentLessonId?: string }>) {
	const playerRef = useRef<ReactPlayer | null>(null);
	const { isClient } = useHydrationFix();
	const { newEvent: writeEvent } = useEventLog();
	const [isReady, setIsReady] = useState(false);
	const [lastRenderTime, setLastRenderTime] = useState(new Date().getTime());
	useEffect(() => {
		const now = new Date();
		setLastRenderTime(now.getTime());
	}, []);
	const newEvent = useCallback(
		async <K extends EventTypeKeys>(event: EventLog<K>) => {
			// when parentLessonId is not provided, the player is probably not in a lesson during learning
			// (probably inside an editor) so we don't need to write events
			if (parentLessonId) {
				await writeEvent({ ...event, resourceId: parentLessonId });
			}
		},
		[parentLessonId, writeEvent]
	);
	async function onStart() {
		await newEvent({
			type: "LESSON_VIDEO_START",
			payload: undefined
		});
	}

	const onReady = useCallback(() => {
		if (!isReady) {
			if (playerRef.current) {
				playerRef?.current?.seekTo(startAt, "seconds");
			}
			setIsReady(true);
			newEvent({
				type: "LESSON_VIDEO_OPENED",
				payload: { url }
			});
		}
	}, [isReady, startAt, newEvent, url]);

	function onPlay() {
		newEvent({
			type: "LESSON_VIDEO_PLAY",
			payload: { videoCurrentTime: playerRef?.current?.getCurrentTime() ?? 0, url }
		});
	}
	function onPause() {
		// this is fired even when the video ends or on seeking
		newEvent({
			type: "LESSON_VIDEO_PAUSE",
			payload: { videoCurrentTime: playerRef?.current?.getCurrentTime() ?? 0, url }
		});
	}

	function onEnded() {
		newEvent({
			type: "LESSON_VIDEO_END",
			payload: { url }
		});
	}

	function onPlaybackRateChange(videoSpeed: number) {
		newEvent({
			type: "LESSON_VIDEO_SPEED",
			payload: { videoSpeed }
		});
	}

	function onSeek(seconds: number) {
		if (startAt === playerRef?.current?.getCurrentTime()) return;
		if (new Date().getTime() - lastRenderTime < 2000 /* 2 Seconds */) return;
		// TODO write a test for this behavior
		newEvent({
			type: "LESSON_VIDEO_JUMP",
			payload: {
				videoJump: 0,
				videoLand: seconds
			}
		});
	}

	if (!isClient) return <p>The video player cannot render on the server side</p>;
	return (
		<ReactPlayer
			data-testid="video-player"
			url={url}
			ref={playerRef}
			height="100%"
			width="100%"
			controls={true}
			onStart={onStart}
			onPause={onPause}
			onEnded={onEnded}
			onPlay={onPlay}
			onSeek={onSeek}
			onReady={onReady}
			loop={false}
			onPlaybackRateChange={onPlaybackRateChange}
		/>
	);
}
