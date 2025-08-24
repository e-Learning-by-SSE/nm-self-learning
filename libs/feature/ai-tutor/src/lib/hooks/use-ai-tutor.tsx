import { useState, useCallback } from "react";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";

const LOCAL_STORAGE_KEY = "aiTutorCurrentChat";

export function useAiTutor() {
	const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [isTutorOpen, setIsTutorOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	const { data: config } = trpc.llmConfig.get.useQuery();
	const aiResponse = trpc.aiTutor.sendMessage.useMutation();

	// Send message
	const sendMessage = useCallback(async () => {
		if (!input.trim()) return;

		const newMessage = { role: "user", content: input };
		setInput("");
		setLoading(true);

		const updatedMessages = [...messages, newMessage];
		setMessages(updatedMessages);

		try {
			const data = await aiResponse.mutateAsync({
				messages: updatedMessages
			});
			if (data.valid) {
				const aiMessage = { role: "assistant", content: data.response };
				setMessages(prev => [...prev, aiMessage]);
			}
		} catch (err) {
			showToast({
				type: "error",
				title: "Message Failed",
				subtitle: err instanceof Error ? err.message : "Unknown error"
			});
		} finally {
			setLoading(false);
		}
	}, [input, aiResponse, messages]);

	// Keyboard handling
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	// Panel toggle
	const toggleTutor = () => {
		setIsAnimating(true);
		setTimeout(() => {
			setIsTutorOpen(prev => !prev);
			setIsAnimating(false);
		}, 400);
	};

	const closeTutor = () => {
		setIsTutorOpen(false);
	};

	const clearChat = () => {
		setMessages([]);
		localStorage.removeItem(LOCAL_STORAGE_KEY);
	};

	return {
		config,
		messages,
		input,
		loading,
		isTutorOpen,
		isAnimating,
		setInput,
		sendMessage,
		handleKeyDown,
		toggleTutor,
		closeTutor,
		clearChat
	};
}
