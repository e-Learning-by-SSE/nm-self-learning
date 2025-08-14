import { useAiTutorContext } from "../context/ai-tutor-context";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

export function FloatingTutorButton() {
	const { toggleTutor, isAnimating } = useAiTutorContext();

	return (
		<button
			onClick={toggleTutor}
			disabled={isAnimating}
			className="btn btn-primary fixed bottom-6 right-6 z-10 hover:scale-110"
			type="button"
			title="Open AI Tutor"
		>
			<ChatBubbleLeftIcon className="w-6 h-6" />
			<span className="text-base">AI Tutor</span>
		</button>
	);
}
