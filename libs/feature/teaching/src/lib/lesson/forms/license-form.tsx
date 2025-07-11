import { trpc } from "@self-learning/api-client";
import { License } from "@self-learning/types";
import { LoadingBox } from "@self-learning/ui/common";
import { useFormContext } from "react-hook-form";
import { LessonFormModel } from "../lesson-form-model";
import { Form } from "@self-learning/ui/forms";
import { MarkdownListboxMenu } from "@self-learning/markdown";

// Handles loading of licenses and makes them selectable afterwards
export function LicenseForm() {
	const { data: licenses, isLoading } = trpc.licenseRouter.getAll.useQuery();

	if (isLoading) {
		return <LoadingBox />;
	} else {
		return (
			<Form.SidebarSection>
				<Form.SidebarSectionTitle
					title="Lizenz"
					subtitle="Die Lizenz unter der diese Lerneinheit vertrieben wird"
				/>
				<OptionalLicenseSelector licenses={licenses} />
			</Form.SidebarSection>
		);
	}
}

// Checks and handles if there are no licenses available
function OptionalLicenseSelector({ licenses }: { licenses?: License[] }) {
	if (licenses && licenses.length > 0) {
		return <LicenseSelector licenses={licenses} />;
	} else {
		return <p>No Licenses available</p>;
	}
}

// Makes licenses selectable after checking if there are any
export function LicenseSelector({ licenses }: { licenses: License[] }) {
	const { setValue, watch } = useFormContext<LessonFormModel>();
	const currentValue = watch("licenseId");

	const defaultLicense =
		licenses.find(license => license.defaultSuggestion)?.licenseId ?? licenses[0].licenseId;

	const selectedLicense = licenses.find(
		lic => lic.licenseId === (currentValue ?? defaultLicense)
	);

	const options = licenses
		.filter(lic => lic.selectable)
		.map(lic => (lic.oerCompatible ? lic.name : `~~${lic.name}~~ (Nicht OER-kompatibel)`));

	const handleChange = (selectedName: string) => {
		const selected = licenses.find(lic => selectedName.includes(lic.name));
		if (selected) {
			setValue("licenseId", selected.licenseId);
		}
	};

	return (
		<MarkdownListboxMenu
			title="Lizenz wählen"
			displayValue={
				selectedLicense?.oerCompatible
					? selectedLicense.name
					: `~~${selectedLicense?.name}~~ (Nicht OER-kompatibel)`
			}
			options={options}
			onChange={handleChange}
		/>
	);
}
