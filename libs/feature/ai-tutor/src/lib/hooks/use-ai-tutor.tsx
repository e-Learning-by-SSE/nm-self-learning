import { useState, useCallback } from "react";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { Message, PageContext } from "@self-learning/types";
import { useTranslation } from "react-i18next";

/**
 * Hook for AI tutor UI state management
 *
 * Responsibilities:
 * - Message state management
 * - UI state (open/closed, loading, animation)
 * - Page context detection
 * - User interactions (send, clear, toggle)
 */
export function useAiTutor() {
	const { t } = useTranslation("ai-tutor");
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isTutorOpen, setIsTutorOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [pageContext, setPageContext] = useState<PageContext | null>(null);
	const { data: config } = trpc.llmConfig.get.useQuery();
	const sendMessageMutation = trpc.aiTutor.sendMessage.useMutation();

	const detectPageContext = useCallback(() => {
		if (typeof window === "undefined") {
			setPageContext(null);
			return;
		}

		const pathParts = window.location.pathname.split("/").filter(Boolean);
		const coursesIndex = pathParts.indexOf("courses");

		if (coursesIndex === -1) {
			setPageContext(null);
			return;
		}

		const courseSlug = pathParts[coursesIndex + 1];
		const maybeLessonSlug = pathParts[coursesIndex + 2];

		if (maybeLessonSlug) {
			setPageContext({
				type: "lesson",
				lessonSlug: maybeLessonSlug,
				courseSlug
			});
		} else {
			setPageContext({
				type: "course",
				courseSlug
			});
		}
	}, []);

	const sendMessage = useCallback(async () => {
		const trimmedInput = input.trim();

		if (!trimmedInput) {
			return;
		}

		const userMessage: Message = {
			role: "user",
			content: trimmedInput
		};

		setMessages(prev => [...prev, userMessage]);
		setInput("");

		try {
			const response = await sendMessageMutation.mutateAsync({
				messages: [...messages, userMessage],
				pageContext
			});

			const assistantMessage: Message = {
				role: "assistant",
				content: response.content
			};

			setMessages(prev => [...prev, assistantMessage]);
		} catch (error) {
			setMessages(prev => prev.slice(0, -1));
			setInput(trimmedInput);

			showToast({
				type: "error",
				title: t("Message Failed"),
				subtitle: error instanceof Error ? t(error.message) : t("Unknown error")
			});
		}
	}, [input, messages, pageContext, sendMessageMutation, t]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				sendMessage();
			}
		},
		[sendMessage]
	);

	const toggleTutor = useCallback(() => {
		detectPageContext();
		setIsAnimating(true);

		setTimeout(() => {
			setIsTutorOpen(prev => !prev);
			setIsAnimating(false);
		}, 400);
	}, [detectPageContext]);

	const closeTutor = useCallback(() => {
		setIsTutorOpen(false);
	}, []);

	const clearChat = useCallback(() => {
		setMessages([]);
		setInput("");
	}, []);

	const isLoading = sendMessageMutation.isPending;

	return {
		messages,
		input,
		isTutorOpen,
		isAnimating,
		pageContext,
		config,
		isLoading,
		setInput,
		sendMessage,
		handleKeyDown,
		toggleTutor,
		closeTutor,
		clearChat
	};
}

export type UseAiTutorReturn = ReturnType<typeof useAiTutor>;
