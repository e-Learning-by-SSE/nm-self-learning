import { formatTimeIntervalToString } from "@self-learning/util/common";
import { useTranslation } from "next-i18next";
import { useCallback } from "react";

/** Formats durations in the active UI language and updates when the language changes. */
export function useTimeIntervalFormatter() {
	const { t } = useTranslation("common");
	return useCallback((ms: number) => formatTimeIntervalToString(ms, t), [t]);
}
