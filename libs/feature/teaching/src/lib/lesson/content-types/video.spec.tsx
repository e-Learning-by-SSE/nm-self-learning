import { trpc } from "@self-learning/api-client";
import { render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { VideoInput } from "./video";

jest.mock("@self-learning/api-client", () => ({
	trpc: { services: { getTranscriptionServiceUrl: { useQuery: jest.fn() } } }
}));
jest.mock("@self-learning/ui/common", () => ({
	SectionCard: ({ children }: PropsWithChildren) => <div>{children}</div>
}));
jest.mock("@self-learning/ui/forms", () => ({
	GenerateSubtitle: ({ transcriptionServiceUrl }: { transcriptionServiceUrl: string }) => (
		<button data-url={transcriptionServiceUrl}>Generate Subtitle</button>
	),
	LabeledField: ({ children }: PropsWithChildren) => <div>{children}</div>,
	Upload: () => null,
	ModifySubtile: () => null
}));
jest.mock("@self-learning/ui/lesson", () => ({ VideoPlayer: () => null }));
jest.mock("react-hook-form", () => ({
	useFormContext: () => ({ control: {}, watch: () => ({ lessonId: "lesson-id" }) }),
	useFieldArray: () => ({ update: jest.fn() }),
	useWatch: () => ({ value: { url: "https://video.example/video.mp4" }, meta: { duration: 60 } })
}));

describe("VideoInput transcription configuration", () => {
	it.each([
		{ data: undefined, isError: false },
		{ data: null, isError: false },
		{ data: "", isError: false },
		{ data: "https://transcription.example", isError: true }
	])("hides subtitle generation when configuration is unavailable: %j", result => {
		(trpc.services.getTranscriptionServiceUrl.useQuery as jest.Mock).mockReturnValue(result);
		render(<VideoInput index={0} />);
		expect(screen.queryByRole("button", { name: "Generate Subtitle" })).toBeNull();
	});

	it("passes the runtime URL to subtitle generation", () => {
		(trpc.services.getTranscriptionServiceUrl.useQuery as jest.Mock).mockReturnValue({
			data: "https://transcription.example",
			isError: false
		});
		render(<VideoInput index={0} />);
		expect(
			screen.getByRole("button", { name: "Generate Subtitle" }).getAttribute("data-url")
		).toBe("https://transcription.example");
	});
});
