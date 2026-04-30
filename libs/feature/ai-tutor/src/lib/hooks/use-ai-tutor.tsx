import { useState, useCallback, useEffect } from "react";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { Message, PageContext } from "../utils/types";
import { useTranslation } from "react-i18next";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Hook for AI tutor UI state management
 *
 * Responsibilities:
 * - Message state management
 * - UI state (open/closed, loading, animation)
 * - Page context detection (course, lesson within course, standalone lesson)
 * - User interactions (send, clear, toggle)
 */
export function useAiTutor() {
	const { t } = useTranslation("ai-tutor");
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isTutorOpen, setIsTutorOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [hideToggle, setHideToggle] = useState(false);
	const [pageContext, setPageContext] = useState<PageContext | null>(null);
	const { data: config } = trpc.llmConfig.get.useQuery();
	const sendMessageMutation = trpc.aiTutor.sendMessage.useMutation();
	const searchParams = useSearchParams();
	const pathname = usePathname();

	/**
	 * Derive page context directly from the current pathname.
	 *
	 * Supported URL patterns:
	 *   /courses/<courseSlug>                   → course context
	 *   /courses/<courseSlug>/<lessonSlug>      → lesson within course context
	 *   /lessons/<lessonSlug>                   → standalone lesson context (e.g. direct Moodle link)
	 */
	useEffect(() => {
		if (typeof pathname === "undefined") {
			setPageContext(null);
			return;
		}

		const pathParts = pathname.split("/").filter(Boolean);

		// Pattern: /courses/<courseSlug>[/<lessonSlug>]
		const coursesIndex = pathParts.indexOf("courses");
		if (coursesIndex !== -1) {
			const courseSlug = pathParts[coursesIndex + 1];
			const maybeLessonSlug = pathParts[coursesIndex + 2];

			if (!courseSlug) {
				setPageContext(null);
				return;
			}

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
			return;
		}

		// Pattern: /lessons/<lessonSlug> - standalone lesson without course context (e.g. accessed via direct Moodle link)
		const lessonsIndex = pathParts.indexOf("lessons");
		if (lessonsIndex !== -1) {
			const lessonSlug = pathParts[lessonsIndex + 1];
			if (lessonSlug) {
				setPageContext({
					type: "lesson",
					lessonSlug,
					courseSlug: "" // No course context available
				});
				return;
			}
		}

		setPageContext(null);
	}, [pathname]);

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
		setIsAnimating(true);

		setTimeout(() => {
			setIsTutorOpen(prev => !prev);
			setIsAnimating(false);
		}, 400);
	}, []);

	const closeTutor = useCallback(() => {
		setIsTutorOpen(false);
	}, []);

	const clearChat = useCallback(() => {
		setMessages([]);
		setInput("");
	}, []);

	useEffect(() => {
		const modalOpened = searchParams.get("modal");
		if (modalOpened === "open" || !config) {
			setHideToggle(true);
			closeTutor();
		} else {
			setHideToggle(false);
		}
	}, [setHideToggle, closeTutor, searchParams, config]);

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
		clearChat,
		hideToggle
	};
}

export type UseAiTutorReturn = ReturnType<typeof useAiTutor>;
