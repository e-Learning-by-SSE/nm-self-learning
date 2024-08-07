import { useState } from "react";
import { StudentSettingsForm } from "@self-learning/settings";
import { Dialog, DialogActions, OnDialogCloseFn, showToast } from "@self-learning/ui/common";
import { StudentSettings } from "@self-learning/types";
import { trpc } from "@self-learning/api-client";

export function StudentSettingsDialog({
	initialSettings,
	onClose
}: {
	initialSettings?: StudentSettings;
	onClose: OnDialogCloseFn<void>;
}) {
	const [settings, setSettings] = useState(
		initialSettings ?? {
			learningStatistics: false,
			hasLearningDiary: false
		}
	);
	const { mutateAsync: updateSettings } = trpc.settings.updateSettings.useMutation();

	const onSave = async () => {
		try {
			await updateSettings({
				settings
			});
		} catch (error) {
			if (error instanceof Error) {
				showToast({
					type: "error",
					title: "Aktuelle Einstellungen konnten nicht gespeichert werden!",
					subtitle: error.message ?? ""
				});
			}
		}
		onClose();
	};

	const onChange = (checkbox: string, value: boolean) => {
		setSettings({ ...settings, [checkbox]: value });
	};

	return (
		<Dialog
			style={{ height: "50vh", width: "60vw" }}
			title={"Einstellungen"}
			onClose={() => {}}
		>
			<div className="overflow-x-auto p-5">
				<StudentSettingsForm {...settings} onChange={onChange} />
			</div>
			<div className="pt-5" />
			<div className="absolute right-4 bottom-5">
				<DialogActions onClose={onClose}>
					<button className="btn-primary" onClick={onSave}>
						Speichern
					</button>
				</DialogActions>
			</div>
		</Dialog>
	);
}
