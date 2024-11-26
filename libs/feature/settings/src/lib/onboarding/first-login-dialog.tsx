import { trpc } from "@self-learning/api-client";
import { FeatureSettingsForm } from "@self-learning/settings";
import { EditFeatureSettings } from "@self-learning/types";
import { Dialog, DialogActions, showToast } from "@self-learning/ui/common";
import { useSession } from "next-auth/react";
import { useState } from "react";

/**
 * Dialog for the first login of a user. The user can set his settings here.
 * Fully controlled and updates the settings on the server.
 */
export function FirstLoginDialog({ onClose }: { onClose: () => void }) {
	const { mutateAsync: updateSettings } = trpc.me.updateSettings.useMutation();
	const session = useSession();

	const sessionSettings = session.data?.user ?? {
		enabledLearningStatistics: true,
		enabledFeatureLearningDiary: false
	};

	const [settings, setSettings] = useState<EditFeatureSettings>(sessionSettings);

	const handleSettingSave = async () => {
		try {
			await updateSettings({});
			onClose();
		} catch (error) {
			if (error instanceof Error) {
				showToast({
					type: "error",
					title: "Aktuelle Einstellungen konnten nicht gespeichert werden!",
					subtitle: error.message ?? ""
				});
			}
		}
	};

	const handleSettingChange: Parameters<
		typeof FeatureSettingsForm
	>[0]["onChange"] = async update => {
		setSettings(prev => {
			const newSettings = { ...prev, ...update };
			return newSettings;
		});
	};

	return (
		<Dialog style={{ height: "50vh", width: "60vw" }} title={"Einstellungen"} onClose={onClose}>
			<div className="overflow-x-auto p-5">
				<FeatureSettingsForm featureSettings={settings} onChange={handleSettingChange} />
			</div>
			<div className="pt-14" />
			<div className="absolute right-4 bottom-5">
				<DialogActions onClose={onClose}>
					<button className="btn-primary" onClick={handleSettingSave}>
						Speichern
					</button>
				</DialogActions>
			</div>
		</Dialog>
	);
}
