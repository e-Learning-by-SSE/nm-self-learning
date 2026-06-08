import { IconTextButton } from "@self-learning/ui/common";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "next-i18next";

export function FloatingTutorButton({
	onToggle,
	disabled = false,
	hideToggle
}: {
	onToggle: () => void;
	disabled?: boolean;
	hideToggle?: boolean;
}) {
	const { t } = useTranslation("feature-ai-tutor");

	if (hideToggle) return null;

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
