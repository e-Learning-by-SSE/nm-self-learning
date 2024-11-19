import { useMemo, useState } from "react";
import { StudentSettingsForm } from "@self-learning/settings";
import { Dialog, DialogActions, showToast } from "@self-learning/ui/common";
import { StudentSettings } from "@self-learning/types";
import { trpc } from "@self-learning/api-client";

export function StudentSettingsDialog({
	initialSettings,
	onClose
}: {
	initialSettings?: StudentSettings;
	onClose: (settings: StudentSettings) => void;
}) {
	const defaultSetting = useMemo(
		() =>
			initialSettings ?? {
				learningStatistics: false,
				hasLearningDiary: false
			},
		[initialSettings]
	);
	const [settings, setSettings] = useState(defaultSetting);
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
		onClose(settings);
	};

	const onChange = (checkbox: string, value: boolean) => {
		const newSettings = { ...settings, [checkbox]: value };

		if (checkbox === "hasLearningDiary" && value === true) {
			newSettings.learningStatistics = true;
		}

		// Automatically disable learning diary if learning statistics are disabled
		if (checkbox === "learningStatistics" && value === false) {
			newSettings.hasLearningDiary = false;
		}

		setSettings(newSettings);
	};

	return (
		<Dialog
			style={{ height: "50vh", width: "60vw" }}
			title={"Einstellungen"}
			onClose={() => onClose(defaultSetting)}
		>
			<div className="overflow-x-auto p-5">
				<StudentSettingsForm {...settings} onChange={onChange} />
			</div>
			<div className="pt-14" />
			<div className="absolute right-4 bottom-5">
				<DialogActions onClose={() => onClose(defaultSetting)}>
					<button className="btn-primary" onClick={onSave}>
						Speichern
					</button>
				</DialogActions>
			</div>
		</Dialog>
	);
}
