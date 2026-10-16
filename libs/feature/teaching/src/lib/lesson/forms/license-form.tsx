import { trpc } from "@self-learning/api-client";
import { License } from "@self-learning/types";
import { LoadingBox } from "@self-learning/ui/common";
import { useFormContext } from "react-hook-form";
import { LessonFormModel } from "../lesson-form-model";
import { Form } from "@self-learning/ui/forms";
import { MarkdownListboxMenu } from "@self-learning/markdown";
import { useTranslation } from "next-i18next";

// Handles loading of licenses and makes them selectable afterwards
export function LicenseForm() {
	const { t } = useTranslation("feature-teaching");
	const { data: licenses, isLoading } = trpc.licenseRouter.getAll.useQuery();

	if (isLoading) {
		return <LoadingBox />;
	} else {
		return (
			<Form.SidebarSection>
				<Form.SidebarSectionTitle
					title={t("License_Title")}
					subtitle={t("License_Subtitle")}
				/>
				<OptionalLicenseSelector licenses={licenses} />
			</Form.SidebarSection>
		);
	}
}

// Checks and handles if there are no licenses available
function OptionalLicenseSelector({ licenses }: { licenses?: License[] }) {
	const { t } = useTranslation("feature-teaching");
	if (licenses && licenses.length > 0) {
		return <LicenseSelector licenses={licenses} />;
	} else {
		return <p>{t("License_None_Available")}</p>;
	}
}

// Makes licenses selectable after checking if there are any
export function LicenseSelector({ licenses }: { licenses: License[] }) {
	const { t } = useTranslation("feature-teaching");
	const { setValue, watch } = useFormContext<LessonFormModel>();
	const currentValue = watch("licenseId");

	const defaultLicense =
		licenses.find(license => license.defaultSuggestion)?.licenseId ?? licenses[0].licenseId;

	const selectedLicense = licenses.find(
		lic => lic.licenseId === (currentValue ?? defaultLicense)
	);

	const options = licenses
		.filter(lic => lic.selectable)
		.map(lic =>
			lic.oerCompatible
				? lic.name
				: `~~${lic.name}~~ (${t("License_Not_OER_Compatible")})`
		);

	const handleChange = (selectedName: string) => {
		const selected = licenses.find(lic => selectedName.includes(lic.name));
		if (selected) {
			setValue("licenseId", selected.licenseId);
		}
	};

	return (
		<MarkdownListboxMenu
			title={t("License_Select_Title")}
			displayValue={
				selectedLicense?.oerCompatible
					? selectedLicense.name
					: `~~${selectedLicense?.name}~~ (${t("License_Not_OER_Compatible")})`
			}
			options={options}
			onChange={handleChange}
		/>
	);
}
