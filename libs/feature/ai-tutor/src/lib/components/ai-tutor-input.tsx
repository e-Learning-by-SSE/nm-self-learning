import { AiTutorInputProps } from "@self-learning/types";

export function AiTutorInput({
	input,
	isLoading,
	setInput,
	sendMessage,
	handleKeyDown,
	t
}: AiTutorInputProps) {
	return (
		<div className="p-4 bg-white/10 border-t border-white/20">
			<div className="flex gap-3">
				<textarea
					value={input}
					onChange={e => {
						setInput(e.target.value);
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
					onClick={sendMessage}
					disabled={isLoading || !input.trim()}
					className="btn btn-primary max-h-12 self-end disabled:opacity-50"
					aria-label={t("Send message")}
				>
					{t("Send")}
				</button>
			</div>
		</div>
	);
}
