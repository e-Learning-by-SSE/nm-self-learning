import { useSession } from "next-auth/react";
import { AiTutorHeader } from "./ai-tutor-header";
import { AiTutorMessages } from "./ai-tutor-messages";
import { AiTutorInput } from "./ai-tutor-input";
import { useTranslation } from "react-i18next";
import { AiTutorProps } from "@self-learning/types";

/**
 * AI Tutor Component
 *
 * Features:
 * - Slide-in panel with backdrop blur
 * - Message display with markdown support
 * - User input with keyboard shortcuts
 * - Clear chat and close actions
 */
export function AiTutor({ tutorState }: AiTutorProps) {
	const {
		config,
		messages,
		input,
		isLoading,
		setInput,
		sendMessage,
		handleKeyDown,
		isTutorOpen,
		closeTutor,
		clearChat
	} = tutorState ?? {};

	const session = useSession();
	const user = session.data?.user;
	const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
	const { t } = useTranslation("ai-tutor");

	if (!config) {
		return null;
	}

	return (
		<div
			className={`fixed top-0 right-0 h-full w-2/6 z-20 transform transition-all duration-400 ease-out
				${isTutorOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
			aria-hidden={!isTutorOpen}
		>
			<div className="h-full bg-white/20 backdrop-blur-xl border-l border-white/30 shadow-2xl">
				<div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-blue-500/10" />

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
						input={input}
						isLoading={isLoading}
						setInput={setInput}
						sendMessage={sendMessage}
						handleKeyDown={handleKeyDown}
						t={t}
					/>
				</div>
			</div>
		</div>
	);
}
