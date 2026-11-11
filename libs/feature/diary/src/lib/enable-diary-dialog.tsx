import { FeatureSettingsForm } from "@self-learning/profile";
import { EditFeatureSettings } from "@self-learning/types";
import { Dialog, DialogActions, OnDialogCloseFn, showToast } from "@self-learning/ui/common";
import { useTranslation } from "next-i18next";

/**
 * Dialog to enable learning diary.
 *
 * @param onClose - Function is called when the dialog is closed (is called when the dialog submitted)
 * @param onSubmit - Function is called when the dialog is submitted and not aborted
 */
export function EnableLearningDiaryDialog({
	onClose,
	onSubmit
}: {
	onClose: OnDialogCloseFn<EditFeatureSettings>;
	onSubmit: OnDialogCloseFn<EditFeatureSettings>;
}) {
	const { t } = useTranslation("feature-diary");
	// currently the dialog is the same as the setting dialog so they are reused. When we have
	// more feature settings, we can create a more specific dialog for the learning diary.
	const settingSuggestion = {
		learningDiary: true,
		learningStatistics: true
	};

	const updateSetting = () => {
		showToast({
			type: "info",
			title: t("Diary_Settings_Title"),
			subtitle: t("Diary_Settings_Required_Notice")
		});
	};

	const save = async () => {
		onSubmit(settingSuggestion);
		onClose(settingSuggestion);
	};

	return (
		<Dialog
			className="fixed inset-0 flex overflow-y-auto"
			title={t("Enable_Learning_Diary_Title")}
			onClose={onClose}
		>
			<div className="w-full max-w-3xl h-3/4 p-6 ">
				<p className="my-8">{t("Enable_Learning_Diary_Description")}</p>
				<FeatureSettingsForm featureSettings={settingSuggestion} onChange={updateSetting} />
			</div>
			<DialogActions onClose={onClose}>
				<button className="btn-primary" onClick={save}>
					{t("Save_And_Enable")}
				</button>
			</DialogActions>
		</Dialog>
	);
}
