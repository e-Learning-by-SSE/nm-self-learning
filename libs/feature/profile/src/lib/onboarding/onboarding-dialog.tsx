"use client";
import { trpc } from "@self-learning/api-client";
import { FeatureSettingsForm } from "@self-learning/profile";
import { Dialog, DialogActions, showToast } from "@self-learning/ui/common";
import { useSession } from "next-auth/react";
import { useState } from "react";

/**
 * Dialog for the first login of a user. The user can set his settings here.
 * Fully controlled and updates the settings on the server.
 */
export function OnboardingDialog({
	onClose,
	onSubmit
}: {
	onClose: () => void;
	onSubmit: () => void;
}) {
	const session = useSession();
	const user = session.data?.user;
	const { mutateAsync: update } = trpc.me.update.useMutation();

	const settingSuggestion = {
		learningStatistics: true,
		learningDiary: false
	};

	const [settings, setSettings] = useState<typeof settingSuggestion>(settingSuggestion);

	const handleSettingSave = async () => {
		try {
			await update({ user: { registrationCompleted: true } });
			await onClose();
			onSubmit?.();
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
				<DialogActions
					onClose={() => {
						onClose?.();
					}}
				>
					<button className="btn-primary" onClick={handleSettingSave}>
						Speichern
					</button>
				</DialogActions>
			</div>
		</Dialog>
	);
}
