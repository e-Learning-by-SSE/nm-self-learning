"use client";
import { trpc } from "@self-learning/api-client";
import { useId, useMemo } from "react";
import { useTranslation } from "next-i18next";

/**
 * Skill ids the user can reach through an active group membership.
 * Undefined while the checkbox is off or the query is still loading, so the tree stays visible.
 */
export function useAccessibleSkillIds(enabled: boolean) {
	const { data: skillIds } = trpc.permission.getMySkillIds.useQuery(undefined, { enabled });
	return useMemo(() => {
		if (!enabled || !skillIds) return undefined;
		return new Set(skillIds);
	}, [enabled, skillIds]);
}

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
