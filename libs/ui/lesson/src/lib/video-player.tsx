"use client";

import { trpc } from "@self-learning/api-client";
import { useEventLog } from "@self-learning/ui/common";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player/lazy";

function useHydrationFix() {
	// hydration error workaround https://github.com/cookpete/react-player/issues/1474#issuecomment-1484028123
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);
	return { isClient };
}

export function VideoPlayer({ url, startAt = 0 }: Readonly<{ url: string; startAt: number }>) {
	const playerRef = useRef<ReactPlayer | null>(null);
	const { isClient } = useHydrationFix();
	const { newEvent } = useEventLog();
	const [isReady, setIsReady] = useState(false);

	async function onStart() {
		await newEvent({
			action: "VIDEO_START",
			resourceId: undefined /*TODO*/,
			payload: undefined
		});
	}

	const onReady = useCallback(() => {
		if (!isReady) {
			if (playerRef.current) {
				playerRef?.current?.seekTo(startAt, "seconds");
			}
			setIsReady(true);
			newEvent({ action: "VIDEO_OPENED", resourceId: undefined /*TODO*/, payload: { url } });
		}
	}, [isReady, startAt, newEvent, url]);

	function onPlay() {
		newEvent({
			action: "VIDEO_PLAY",
			resourceId: undefined /*TODO*/,
			payload: { videoCurrentTime: playerRef?.current?.getCurrentTime() ?? 0 }
		});
	}
	function onPause() {
		// this is fired even when the video ends or on seeking
		newEvent({
			action: "VIDEO_PAUSE",
			resourceId: undefined /*TODO*/,
			payload: { videoCurrentTime: playerRef?.current?.getCurrentTime() ?? 0 }
		});
	}

	function onEnded() {
		newEvent({ action: "VIDEO_END", resourceId: undefined /*TODO*/, payload: undefined });
	}

	function onPlaybackRateChange(videoSpeed: number) {
		newEvent({
			action: "VIDEO_SPEED",
			resourceId: undefined /*TODO*/,
			payload: { videoSpeed }
		});
	}

	function onSeek(seconds: number) {
		if (startAt === playerRef?.current?.getCurrentTime()) return;
		newEvent({
			action: "VIDEO_JUMP",
			resourceId: undefined /*TODO*/,
			payload: {
				videoJump: 0,
				videoLand: seconds
			}
		});
	}
	if (!isClient) return <p>The video player cannot render on the server side</p>;
	return (
		<ReactPlayer
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
