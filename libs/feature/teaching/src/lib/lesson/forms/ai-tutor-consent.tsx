import { Form } from "@self-learning/ui/forms";
import { Toggle } from "@self-learning/ui/common";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { LessonFormModel } from "../lesson-form-model";

export function AiTutorConsent() {
	const { setValue, watch } = useFormContext<LessonFormModel>();
	const [isEnabled, setIsEnabled] = useState(watch("ragEnabled") ?? false);

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle
				title="AI Tutor Consent"
				subtitle="Consent to use this content for AI Tutor Context"
				children={
					<Toggle
						label=""
						value={isEnabled}
						onChange={() => {
							setIsEnabled(!isEnabled);
							setValue("ragEnabled", !isEnabled);
						}}
					/>
				}
			/>
			<ContentConsentSection isEnabled={isEnabled} />
		</Form.SidebarSection>
	);
}

function ContentConsentSection({ isEnabled }: { isEnabled: boolean }) {
	if (isEnabled) {
		return (
			<p className="text-sm text-green-600">
				You have consented to use this content for AI Tutor Context.
			</p>
		);
	} else {
		return (
			<p className="text-sm text-rose-500">
				You have not consented to use this content for AI Tutor Context.
			</p>
		);
	}
}
