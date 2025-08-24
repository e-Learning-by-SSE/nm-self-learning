import { IconButton } from "@self-learning/ui/common";
import { useAiTutorContext } from "../context/ai-tutor-context";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

export function FloatingTutorButton() {
	const { toggleTutor, isAnimating } = useAiTutorContext();

	return (
		<IconButton
			icon={<ChatBubbleLeftIcon className="w-6 h-6" />}
			onClick={toggleTutor}
			disabled={isAnimating}
			className="fixed bottom-6 right-6 z-10 hover:scale-110"
			type="button"
			title="Open AI Tutor"
			text="AI Tutor"
		/>
	);
}
