import { IconTextButton } from "@self-learning/ui/common";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { FloatingTutorButtonProps } from "@self-learning/types";

export function FloatingTutorButton({ onToggle, disabled = false }: FloatingTutorButtonProps) {
	const { t } = useTranslation("ai-tutor");

	return (
		<IconTextButton
			icon={<ChatBubbleLeftIcon className="w-6 h-6" />}
			onClick={onToggle}
			disabled={disabled}
			className="btn-primary fixed bottom-6 right-6 z-10 hover:scale-110 transition-transform"
			type="button"
			title={t("Open AI Tutor")}
			text={t("AI Tutor")}
		/>
	);
}
