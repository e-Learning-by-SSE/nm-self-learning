import { useSession } from "next-auth/react";
import { AiTutorHeader } from "./ai-tutor-header";
import { AiTutorMessages } from "./ai-tutor-messages";
import { AiTutorInput } from "./ai-tutor-input";
import { useTranslation } from "next-i18next";
import { UseAiTutorReturn } from "../hooks/use-ai-tutor";
import { useEffect, useState } from "react";

/**
 * AI Tutor Component
 *
 * Features:
 * - Slide-in panel with backdrop blur
 * - Message display with markdown support
 * - User input with keyboard shortcuts
 * - Clear chat and close actions
 */
export function AiTutor({ tutorState }: { tutorState: UseAiTutorReturn }) {
	const [top, setTop] = useState(0);

	useEffect(() => {
		const navigation = document.getElementById("site-navigation");
		if (!navigation) return;

		const updateTop = () => setTop(Math.max(0, navigation.getBoundingClientRect().bottom));
		const observer = new ResizeObserver(updateTop);
		observer.observe(navigation);
		const systemMessage = document.getElementById("site-system-message");
		if (systemMessage) observer.observe(systemMessage);
		window.addEventListener("scroll", updateTop, { passive: true });
		window.addEventListener("resize", updateTop);
		updateTop();
		return () => {
			observer.disconnect();
			window.removeEventListener("scroll", updateTop);
			window.removeEventListener("resize", updateTop);
		};
	}, []);

	const {
		config,
		messages,
		isLoading,
		sendMessage,
		inputClearSignal,
		isTutorOpen,
		closeTutor,
		clearChat
	} = tutorState ?? {};

	const session = useSession();
	const user = session.data?.user;
	const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
	const { t } = useTranslation("feature-ai-tutor");

	if (!config) {
		return null;
	}

	return (
		<div
			className={`fixed bottom-0 right-0 z-20 transform transition-[transform,opacity] duration-500 ease-out
                w-full sm:w-11/12 md:w-4/5 lg:w-2/3 xl:w-2/6
                ${isTutorOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
			aria-hidden={!isTutorOpen}
			inert={!isTutorOpen}
			style={{ top }}
		>
			<div className="h-full bg-white/20 backdrop-blur-xl border-l border-white/30 shadow-2xl">
				<div className="absolute inset-0 bg-linear-to-br from-c-primary-strong/10 via-c-primary/10 to-c-primary-muted/10" />

				<div className="relative h-full flex flex-col">
					<AiTutorHeader
						onClose={closeTutor}
						onClear={clearChat}
						t={t}
						basePath={basePath}
					/>
					<AiTutorMessages
						messages={messages}
						isLoading={isLoading}
						user={user}
						basePath={basePath}
						t={t}
					/>
					<AiTutorInput
						isLoading={isLoading}
						sendMessage={sendMessage}
						clearSignal={inputClearSignal}
						t={t}
					/>
				</div>
			</div>
		</div>
	);
}
