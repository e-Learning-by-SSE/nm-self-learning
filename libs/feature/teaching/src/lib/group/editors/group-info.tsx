import { SectionHeader } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { useFormContext } from "react-hook-form";
import { GroupFormModel } from "../group-editor";
import { LabeledField } from "@self-learning/ui/forms";

export function GroupInfoEditor() {
	const form = useFormContext<GroupFormModel>();
	const {
		register,
		control,
		formState: { errors }
	} = form;
	return (
		<CenteredSection>
			<SectionHeader title="Grunddaten" subtitle="Grunddaten dieser Gruppe." />
			<div className="flex flex-col gap-4">
				<LabeledField label="Titel" error={errors.name?.message}>
					<input
						{...register("name")}
						type="text"
						className="textfield"
						placeholder="Name der neuen Gruppe"
					/>
				</LabeledField>
			</div>
		</CenteredSection>
	);
}
