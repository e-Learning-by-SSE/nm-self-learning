import { Form } from "@self-learning/ui/forms";
import { Toggle } from "@self-learning/ui/common";
import { Controller, useFormContext } from "react-hook-form";
import { LessonFormModel } from "../lesson-form-model";

export function AiTutorConsent() {
	const form = useFormContext<LessonFormModel>();
	const { control } = form;

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle
				title="AI Tutor Consent"
				subtitle="Consent to use this content for AI Tutor Context"
				children={
					<Controller
						name={"ragEnabled"}
						control={control}
						render={({ field }) => (
							<Toggle
								label=""
								value={field.value ?? false}
								onChange={checked => {
									field.onChange(checked);
								}}
							/>
						)}
					/>
				}
			/>
			<Controller
				name={"ragEnabled"}
				control={control}
				render={({ field }) => <ContentConsentSection isEnabled={field.value ?? false} />}
			/>
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
