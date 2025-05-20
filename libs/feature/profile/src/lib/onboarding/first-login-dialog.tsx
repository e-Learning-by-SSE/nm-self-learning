"use client";
import { trpc } from "@self-learning/api-client";
import { loadFromLocalStorage, saveToLocalStorage } from "@self-learning/local-storage";
import { FeatureSettingsForm } from "@self-learning/profile";
import { EditFeatureSettings } from "@self-learning/types";
import { Dialog, DialogActions, showToast } from "@self-learning/ui/common";
import { isBefore, subDays } from "date-fns";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useFirstLoginDialog = (): boolean => {
	const [shouldRender, setShouldRender] = useState<boolean>(false);

	useEffect(() => {
		const lastShown: Date | null = loadFromLocalStorage(
			"settings_firstLoginDialog_lastRendered"
		);
		const oneDayAgo = subDays(new Date(), 1);

		if (!lastShown) {
			setShouldRender(true);
			saveToLocalStorage("settings_firstLoginDialog_lastRendered", new Date());
		} else if (isBefore(lastShown, oneDayAgo)) {
			setShouldRender(true);
			saveToLocalStorage("settings_firstLoginDialog_lastRendered", new Date());
		}
	}, []);

	return shouldRender;
};

/**
 * Dialog for the first login of a user. The user can set his settings here.
 * Fully controlled and updates the settings on the server.
 */
export function FirstLoginDialog({ onClose }: { onClose: () => void }) {
	const session = useSession();
	const user = session.data?.user;
	const { mutateAsync: updateSettings } = trpc.me.updateSettings.useMutation();

	const settingSuggestion = {
		enabledLearningStatistics: true,
		enabledFeatureLearningDiary: false
	};

	const [settings, setSettings] = useState<EditFeatureSettings>(settingSuggestion);

	const handleSettingSave = async () => {
		try {
			await updateSettings({ user: { ...settings, registrationCompleted: true } });
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
		<Dialog
			style={{ height: "50vh", width: "60vw" }}
			title={`Willkommen ${user?.name}!`}
			onClose={onClose}
		>
			<div className="p-5">
				<p className="mt-2">
					Wir sehen, du bist das erste mal bei uns. Bitte wähle die Einstellungen, die du
					für die Nutzung der Plattform bevorzugst. Du kannst sie jederzeit wieder ändern.
				</p>
			</div>
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
