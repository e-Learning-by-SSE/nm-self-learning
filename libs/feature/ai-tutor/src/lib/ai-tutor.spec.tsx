// import { act, render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSession } from "next-auth/react";
import { trpc } from "@self-learning/api-client";
// import { AiTutorProvider } from "./context/ai-tutor-context";
// import { AiTutor } from "./components/ai-tutor";
// import { showToast } from "@self-learning/ui/common";

// Mock dependencies
jest.mock("next-auth/react");
jest.mock("@self-learning/api-client", () => ({
	trpc: {
		llmConfig: {
			get: {
				useQuery: jest.fn()
			}
		},
		aiTutor: {
			sendMessage: {
				useMutation: jest.fn()
			}
		}
	}
}));
jest.mock("@self-learning/ui/common", () => ({
	showToast: jest.fn(),
	IconButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
	IconOnlyButton: ({ onClick }: any) => <button onClick={onClick}>Icon</button>
}));

jest.mock("react-markdown", () => ({
	__esModule: true,
	default: ({ children }: { children: string }) => <div>{children}</div>
}));

describe("AI Tutor", () => {
	const mockSession = {
		data: {
			user: {
				name: "Test User",
				avatarUrl: "/test-avatar.png"
			}
		}
	};

	const mockConfig = {
		enabled: true,
		model: "gpt-3.5-turbo"
	};

	const mockMutateAsync = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useSession as jest.Mock).mockReturnValue(mockSession);
		(trpc.llmConfig.get.useQuery as jest.Mock).mockReturnValue({ data: mockConfig });
		(trpc.aiTutor.sendMessage.useMutation as jest.Mock).mockReturnValue({
			mutateAsync: mockMutateAsync
		});
	});

	// it("should send messages and display responses", async () => {
	// 	mockMutateAsync.mockResolvedValueOnce({
	// 		valid: true,
	// 		response: "Hello! I'm your AI tutor."
	// 	});

	// 	render(
	// 		<AiTutorProvider>
	// 			<AiTutor />
	// 		</AiTutorProvider>
	// 	);

	// 	const input = screen.getByPlaceholderText("Ask anything about the course...");
	// 	const sendButton = screen.getByText("Send");

	// 	// Type and send a message
	// 	fireEvent.change(input, { target: { value: "Hello" } });
	// 	await act(async () => {
	// 		fireEvent.click(sendButton);
	// 	});

	// 	// Check if the message was sent
	// 	expect(mockMutateAsync).toHaveBeenCalledWith({
	// 		messages: [{ role: "user", content: "Hello" }]
	// 	});

	// 	// Check if response is displayed
	// 	expect(screen.getByText("Hello! I'm your AI tutor.")).toBeInTheDocument();
	// });

	// it("should handle errors when sending messages", async () => {
	// 	const error = new Error("Network error");
	// 	mockMutateAsync.mockRejectedValueOnce(error);

	// 	render(
	// 		<AiTutorProvider>
	// 			<AiTutor />
	// 		</AiTutorProvider>
	// 	);

	// 	const input = screen.getByPlaceholderText("Ask anything about the course...");
	// 	const sendButton = screen.getByText("Send");

	// 	// Type and send a message
	// 	fireEvent.change(input, { target: { value: "Hello" } });
	// 	await act(async () => {
	// 		fireEvent.click(sendButton);
	// 	});

	// 	expect(showToast).toHaveBeenCalledWith({
	// 		type: "error",
	// 		title: "Message Failed",
	// 		subtitle: "Network error"
	// 	});
	// });
});
