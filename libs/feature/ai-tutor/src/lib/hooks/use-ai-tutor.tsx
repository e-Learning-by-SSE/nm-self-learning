import { useState, useCallback } from "react";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { Message, PageContext } from "@self-learning/types";
import { useTranslation } from "react-i18next";

export function useAiTutor() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [isTutorOpen, setIsTutorOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [pageContext, setPageContext] = useState<PageContext | null>(null);
	const { t } = useTranslation("ai-tutor");

	const { data: config } = trpc.llmConfig.get.useQuery();
	const aiResponse = trpc.aiTutor.sendMessage.useMutation();

	const detectPageContext = useCallback(() => {
		if (typeof window === "undefined") return null;
		const pathParts = window.location.pathname.split("/").filter(Boolean);
		const coursesIndex = pathParts.indexOf("courses");
		if (coursesIndex === -1) {
			setPageContext(null);
			return;
		}

		const courseSlug = pathParts[coursesIndex + 1];
		const maybeLessonSlug = pathParts[coursesIndex + 2];

		if (maybeLessonSlug) {
			setPageContext({ type: "lesson", lessonSlug: maybeLessonSlug, courseSlug });
		} else {
			setPageContext({ type: "course", courseSlug });
		}
	}, []);

	const sendMessage = useCallback(async () => {
		if (!input.trim()) return;

		const newMessage = { role: "user", content: input };
		setInput("");
		setLoading(true);

		const updatedMessages = [...messages, newMessage];
		setMessages(updatedMessages);

		try {
			const data = await aiResponse.mutateAsync({
				messages: updatedMessages,
				pageContext: pageContext
			});
			if (data.valid) {
				const aiMessage = { role: "assistant", content: data.response };
				setMessages(prev => [...prev, aiMessage]);
			}
		} catch (err) {
			showToast({
				type: "error",
				title: t("Message Failed"),
				subtitle: err instanceof Error ? t(err.message) : t("Unknown error")
			});
		} finally {
			setLoading(false);
		}
	}, [input, aiResponse, messages, t, pageContext]);

	// Keyboard handling
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	// Panel toggle
	const toggleTutor = () => {
		detectPageContext();
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
		clearChat,
		pageContext
	};
}
