/** @jest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import io from "socket.io-client";
import { GenerateSubtitle } from "./upload";

jest.mock("@self-learning/api-client", () => ({
	trpc: { me: { getJWTToken: { useQuery: () => ({ data: "token" }) } } }
}));
jest.mock("@self-learning/ui/common", () => ({
	CenteredContainer: ({ children }: PropsWithChildren) => <div>{children}</div>,
	Dialog: ({ children }: PropsWithChildren) => <div>{children}</div>,
	DialogActions: ({ children }: PropsWithChildren) => <div>{children}</div>
}));
jest.mock("@self-learning/util/common", () => ({}));
jest.mock("socket.io-client", () => ({ __esModule: true, default: jest.fn() }));

it("connects to the supplied URL and reconnects when it changes", () => {
	const firstSocket = { on: jest.fn(), disconnect: jest.fn() };
	const secondSocket = { on: jest.fn(), disconnect: jest.fn() };
	(io as jest.Mock).mockReturnValueOnce(firstSocket).mockReturnValueOnce(secondSocket);
	const props = {
		video_url: "https://video.example/video.mp4",
		lessonId: "lesson-id",
		onTranscriptionCompleted: jest.fn()
	};
	const { rerender, unmount } = render(
		<GenerateSubtitle {...props} transcriptionServiceUrl="https://transcription-a.example" />
	);
	fireEvent.click(screen.getByRole("button", { name: "Generate Subtitle" }));
	expect(io).toHaveBeenLastCalledWith("https://transcription-a.example");

	rerender(
		<GenerateSubtitle {...props} transcriptionServiceUrl="https://transcription-b.example" />
	);
	expect(firstSocket.disconnect).toHaveBeenCalledTimes(1);
	expect(io).toHaveBeenLastCalledWith("https://transcription-b.example");

	unmount();
	expect(secondSocket.disconnect).toHaveBeenCalledTimes(1);
});
