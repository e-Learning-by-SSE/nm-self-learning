"use client";
import { useId } from "react";
import { useTranslation } from "next-i18next";

/** Same checkbox row as "show only my groups". */
export function OnlyOwnSkillsCheckbox({
	checked,
	onChange
}: {
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	const { t } = useTranslation("feature-teaching");
	const inputId = useId();

	return (
		<div className="mt-4 flex items-center flex-wrap gap-2 px-4">
			<input
				id={inputId}
				type="checkbox"
				checked={checked}
				onChange={event => onChange(event.target.checked)}
				className="checkbox"
			/>
			<label htmlFor={inputId} className="text-light">
				{t("Show_Only_My_Skills")}
			</label>
		</div>
	);
}
