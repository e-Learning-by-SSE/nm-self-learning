import { useTranslation } from "next-i18next";

export function useEditorTabs() {
	const { t } = useTranslation("common");

	return [
		{ label: t("KeeTabBasic"), path: "edit" },
		{ label: t("KeeTabSkills"), path: "skills" },
		{ label: t("KeeTabModules"), path: "modules" },
		{ label: t("KeeTabPreview"), path: "preview" }
	];
}
