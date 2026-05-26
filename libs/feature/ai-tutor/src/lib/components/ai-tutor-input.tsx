import { useEffect, useRef } from "react";

export function AiTutorInput({
	isLoading,
	sendMessage,
	clearSignal,
	t
}: {
	isLoading: boolean;
	sendMessage: (message: string) => Promise<boolean>;
	clearSignal: number;
	t: (key: string) => string;
}) {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.value = "";
			textareaRef.current.style.height = "auto";
		}
	}, [clearSignal]);

	const handleSend = async () => {
		const message = textareaRef.current?.value ?? "";

		if (!message.trim() || isLoading) {
			return;
		}

		const wasSent = await sendMessage(message);
		if (wasSent && textareaRef.current) {
			textareaRef.current.value = "";
			textareaRef.current.style.height = "auto";
		}
	};

	const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			await handleSend();
		}
	};

	return (
		<div className="p-4 bg-white/10 border-t border-white/20">
			<div className="flex gap-3">
				<textarea
					ref={textareaRef}
					onChange={e => {
						e.target.style.height = "auto";
						e.target.style.height = `${e.target.scrollHeight}px`;
					}}
					onKeyDown={handleKeyDown}
					disabled={isLoading}
					placeholder={t("Ask anything about the course...")}
					className="flex-1 px-4 py-3 bg-white/60 rounded-xl max-h-48 min-h-16 disabled:opacity-50"
					aria-label={t("Message input")}
				/>
				<button
					onClick={handleSend}
					disabled={isLoading}
					className="btn btn-primary max-h-12 self-end disabled:opacity-50"
					aria-label={t("Send message")}
				>
					{t("Send")}
				</button>
			</div>
		</div>
	);
}
