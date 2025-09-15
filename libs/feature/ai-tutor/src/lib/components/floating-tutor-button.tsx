import { IconButton } from "@self-learning/ui/common";
import { useAiTutorContext } from "../context/ai-tutor-context";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { withTranslations } from "@self-learning/api";

export function FloatingTutorButton() {
	const { toggleTutor, isAnimating } = useAiTutorContext();
	const { t } = useTranslation("ai-tutor");

	return (
		<IconButton
			icon={<ChatBubbleLeftIcon className="w-6 h-6" />}
			onClick={toggleTutor}
			disabled={isAnimating}
			className="fixed bottom-6 right-6 z-10 hover:scale-110"
			type="button"
			title={t("Open AI Tutor")}
			text={t("AI Tutor")}
		/>
	);
}
export const getServerSideProps = withTranslations(["common", "ai-tutor"]);
