import { trpc } from "@self-learning/api-client";
import { FeatureSettingsForm } from "@self-learning/settings";
import { EditFeatureSettings } from "@self-learning/types";
import { Dialog, DialogActions, OnDialogCloseFn, showToast } from "@self-learning/ui/common";

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
	const { mutateAsync: updateSettings } = trpc.me.updateSettings.useMutation();
	const settingSuggestion: EditFeatureSettings = {
		enabledLearningStatistics: true,
		enabledFeatureLearningDiary: true
	};

	const updateSetting = () => {
		showToast({
			type: "info",
			title: "Einstellungen",
			subtitle:
				"Ohne diese Einstellungen kann das Lerntagebuch nicht verwendet werden. Wenn du das nicht möchtest, klicke auf abbrechen."
		});
	};

	const save = async () => {
		await updateSettings({ user: { ...settingSuggestion } });
		onSubmit();
		onClose();
	};

	return (
		<Dialog
			className="fixed inset-0 flex overflow-y-auto"
			title={`Lerntagebuch aktivieren`}
			onClose={onClose}
		>
			<div className="w-full max-w-3xl h-3/4 p-6 ">
				<p className="my-8">
					Durch das Nutzen des Lerntagebuchs, werden die unten stehenden Funktionen der
					Plattform aktivierst. Hierbei stimmst du den jeweiligen Bedingungen zu.
				</p>
				<FeatureSettingsForm featureSettings={settingSuggestion} onChange={updateSetting} />
			</div>
			<DialogActions onClose={onClose}>
				<button className="btn-primary" onClick={save}>
					Speichern & Aktivieren
				</button>
			</DialogActions>
		</Dialog>
	);
}
