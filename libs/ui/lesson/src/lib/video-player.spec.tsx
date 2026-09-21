/** @jest-environment jsdom */

import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { VideoPlayer, VideoPlayerHandle } from "./video-player";

const mockWriteEvent = jest.fn();

jest.mock("@self-learning/util/eventlog", () => {
	const { useCallback, useRef, useState } = jest.requireActual("react");
	return {
		useEventLog: () => {
			const [, setRevision] = useState(0);
			const sent = useRef(new Set());
			const newEvent = useCallback(async (event: unknown) => {
				const key = JSON.stringify(event);
				if (sent.current.has(key)) return;
				sent.current.add(key);
				mockWriteEvent(event);
				// Model the rerender caused by the real event-log mutation.
				setRevision((revision: number) => revision + 1);
			}, []);
			return { newEvent };
		}
	};
});

const props = { url: "https://example.com/lesson.mp4", parentLessonId: "lesson-a", courseId: "a" };

async function getVideo(container: HTMLElement) {
	await waitFor(() => expect(container.querySelector("video")).not.toBeNull());
	return container.querySelector("video") as HTMLVideoElement;
}

function changeSpeed(video: HTMLVideoElement, rate: number) {
	act(() => {
		video.playbackRate = rate;
		fireEvent.rateChange(video);
	});
}

beforeEach(() => {
	sessionStorage.clear();
	mockWriteEvent.mockClear();
});

afterEach(() => jest.restoreAllMocks());

it("keeps the selected speed through analytics rerenders, pause, resume and seeking", async () => {
	const { container, rerender } = render(<VideoPlayer {...props} />);
	const video = await getVideo(container);
	changeSpeed(video, 1.5);
	await waitFor(() => expect(video.playbackRate).toBe(1.5));
	expect(mockWriteEvent).toHaveBeenCalledWith(
		expect.objectContaining({ type: "LESSON_VIDEO_SPEED", payload: { videoSpeed: 1.5 } })
	);

	fireEvent.pause(video);
	fireEvent.play(video);
	fireEvent.seeked(video);
	rerender(<VideoPlayer {...props} startAt={10} />);
	await waitFor(() => expect(video.playbackRate).toBe(1.5));
	changeSpeed(video, 2);
	await waitFor(() => expect(video.playbackRate).toBe(2));
	changeSpeed(video, 1);
	await waitFor(() => expect(video.playbackRate).toBe(1));
});

it("restores the course speed for another video after the player remounts", async () => {
	const first = render(<VideoPlayer {...props} />);
	changeSpeed(await getVideo(first.container), 1.75);
	first.unmount();
	const second = render(<VideoPlayer {...props} url="https://example.com/next.mp4" />);
	const video = await getVideo(second.container);
	await waitFor(() => expect(video.playbackRate).toBe(1.75));
});

it("keeps the speed when the video URL changes within the same course", async () => {
	const { container, rerender } = render(<VideoPlayer {...props} />);
	changeSpeed(await getVideo(container), 1.5);
	rerender(
		<VideoPlayer {...props} url="https://example.com/next.mp4" parentLessonId="lesson-b" />
	);
	const video = await getVideo(container);
	fireEvent.loadStart(video);
	await waitFor(() => expect(video.playbackRate).toBe(1.5));
});

it("keeps course preferences separate when navigating without a page reload", async () => {
	const { container, rerender } = render(<VideoPlayer {...props} />);
	changeSpeed(await getVideo(container), 1.5);
	rerender(<VideoPlayer {...props} courseId="b" />);
	const second = await getVideo(container);
	expect(second.playbackRate).toBe(1);
	changeSpeed(second, 2);
	rerender(<VideoPlayer {...props} />);
	const first = await getVideo(container);
	await waitFor(() => expect(first.playbackRate).toBe(1.5));
});

it.each(["invalid", "0", "-1", "Infinity"])("ignores invalid saved speed %s", async value => {
	sessionStorage.setItem("video-playback-rate:a", value);
	const { container } = render(<VideoPlayer {...props} />);
	expect((await getVideo(container)).playbackRate).toBe(1);
});

it("keeps speed controls working when session storage is blocked", async () => {
	jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
		throw new DOMException("Blocked", "SecurityError");
	});
	jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
		throw new DOMException("Blocked", "SecurityError");
	});
	const { container, rerender } = render(<VideoPlayer {...props} />);
	const video = await getVideo(container);
	changeSpeed(video, 1.5);
	rerender(<VideoPlayer {...props} startAt={5} />);
	await waitFor(() => expect(video.playbackRate).toBe(1.5));
});

it("supports standalone players and preserves the public seek handle", async () => {
	const ref = createRef<VideoPlayerHandle>();
	const { container } = render(<VideoPlayer url={props.url} ref={ref} />);
	const video = await getVideo(container);
	changeSpeed(video, 1.5);
	act(() => ref.current?.setCurrentTime(30));
	expect(ref.current?.getCurrentTime()).toBe(30);
	expect(video.playbackRate).toBe(1.5);
	expect(sessionStorage.length).toBe(0);
});
