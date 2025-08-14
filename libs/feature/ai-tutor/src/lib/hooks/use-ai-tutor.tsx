import { useEffect, useState, useCallback } from "react";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";

const LOCAL_STORAGE_KEY = "aiTutorCurrentChat";

export function useAiTutor() {
	const [formData, setFormData] = useState({ serverUrl: "", apiKey: "", defaultModel: "" });
	const [messages, setMessages] = useState<{ sender: string; content: string }[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [isTutorOpen, setIsTutorOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	const { data: config } = trpc.llmConfig.getForServerUse.useQuery();

	// Load config
	useEffect(() => {
		if (config) {
			setFormData({
				serverUrl: config.serverUrl,
				apiKey: config.apiKey ? config.apiKey : "",
				defaultModel: config.defaultModel
			});
			console.log("AI Tutor Config Loaded:", config);
		}
	}, [config]);

	// Send message
	const sendMessage = useCallback(async () => {
		if (!input.trim() || !formData.serverUrl) return;

		const newMessage = { sender: "user", content: input };
		setMessages(prev => [...prev, newMessage]);
		setInput("");
		setLoading(true);

		try {
			const response = await fetch(formData.serverUrl + "api/generate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: formData.apiKey ? `Bearer ${formData.apiKey}` : ""
				},
				body: JSON.stringify({
					prompt: input,
					model: formData.defaultModel,
					stream: false
				})
			});

			if (!response.ok) throw new Error("Failed to get response from LLM");

			const data = await response.json();
			const aiMessage = { sender: "AI Tutor", content: data.response };
			setMessages(prev => [...prev, aiMessage]);
		} catch (err) {
			showToast({
				type: "error",
				title: "Message Failed",
				subtitle: err instanceof Error ? err.message : "Unknown error"
			});
		} finally {
			setLoading(false);
		}
	}, [input, formData]);

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
