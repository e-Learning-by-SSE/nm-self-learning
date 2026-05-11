import { Form } from "@self-learning/ui/forms";
import { Toggle } from "@self-learning/ui/common";
import { Controller, useFormContext } from "react-hook-form";
import { LessonFormModel } from "../lesson-form-model";
import { useTranslation } from "next-i18next";

export function AiTutorConsent() {
	const form = useFormContext<LessonFormModel>();
	const { control } = form;
	const { t } = useTranslation("ai-tutor");

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle
				title={t("AI Tutor Consent")}
				subtitle={t("Consent to use this content for AI Tutor Context")}
			>
				<Controller
					name={"ragEnabled"}
					control={control}
					render={({ field }) => (
						<Toggle
							label=""
							value={field.value ?? true}
							onChange={checked => {
								field.onChange(checked);
							}}
						/>
					)}
				/>
			</Form.SidebarSectionTitle>
			<Controller
				name={"ragEnabled"}
				control={control}
				render={({ field }) => <ContentConsentSection isEnabled={field.value ?? true} />}
			/>
		</Form.SidebarSection>
	);
}

function ContentConsentSection({ isEnabled }: { isEnabled: boolean }) {
	const { t } = useTranslation("ai-tutor");
	if (isEnabled) {
		return (
			<p className="text-sm text-green-600">
				{t("You have consented to use this content for AI Tutor Context.")}
			</p>
		);
	} else {
		return (
			<p className="text-sm text-rose-500">
				{t("You have not consented to use this content for AI Tutor Context.")}
			</p>
		);
	}
}
