"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { NotificationChannel, NotificationType } from "@prisma/client";
import {
	EditFeatureSettings,
	EditPersonalSettings,
	editPersonalSettingSchema,
	ResolvedValue,
	UserNotificationSetting
} from "@self-learning/types";
import { OnDialogCloseFn, Toggle } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useForm } from "react-hook-form";
import { getUserWithSettings } from "../crud-settings";
import { ExpandableSettingsSection } from "./setting-section";

function ToggleSetting({
	value,
	onChange,
	label
}: {
	value: boolean;
	onChange: (value: boolean) => void;
	label: string;
}) {
	return (
		<div className="flex items-center gap-2">
			<Toggle value={value} onChange={onChange} label={label} />
		</div>
	);
}

type SettingsProps = NonNullable<ResolvedValue<typeof getUserWithSettings>>;

export function PersonalSettingsForm({
	personalSettings,
	onSubmit
}: {
	personalSettings: SettingsProps;
	onSubmit: OnDialogCloseFn<EditPersonalSettings>;
}) {
	const form = useForm({
		defaultValues: personalSettings,
		resolver: zodResolver(editPersonalSettingSchema)
	});

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
			<LabeledField label="Name" error={form.formState.errors.displayName?.message}>
				<input {...form.register("displayName")} type="text" className="textfield" />
			</LabeledField>
			<LabeledField label="E-Mail">
				<input
					type="email"
					disabled
					className="textfield "
					value={
						personalSettings.email ??
						"hier kannst du bald deine E-Mail Adresse hinterlegen"
					}
				/>
			</LabeledField>

			<button className="btn-primary" disabled={!form.formState.isValid}>
				Profile Speichern
			</button>
		</form>
	);
}

export function FeatureSettingsForm({
	featureSettings,
	onChange
}: {
	featureSettings: EditFeatureSettings;
	onChange: OnDialogCloseFn<Partial<EditFeatureSettings>>;
}) {
	const { enabledFeatureLearningDiary, enabledLearningStatistics } = featureSettings;

	const onChangeLtb = (value: boolean) => {
		if (value) {
			onChange({ enabledFeatureLearningDiary: true, enabledLearningStatistics: true });
		}
		onChange({ enabledFeatureLearningDiary: value });
	};

	const onChangeStatistics = (value: boolean) => {
		if (!value) {
			onChange({ enabledLearningStatistics: false, enabledFeatureLearningDiary: false });
		}
		onChange({ enabledLearningStatistics: value });
	};

	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<ToggleSetting
					value={enabledLearningStatistics}
					onChange={onChangeStatistics}
					label="Lernstatistiken"
				/>

				<ExpandableSettingsSection
					text="Erfassung und Speicherung von Sitzungsdaten zur Auswertung des persönlichen Lernverhaltens"
					title="Check this for learning statistics"
				>
					<p>
						Mit dieser Einstellung analysieren wir dein Lernverhalten, um dir
						individuelles Feedback zu geben und personalisierte Statistiken anzuzeigen.
						Hierbei wird nur dein Lernverhalten auf dieser Plattform erfasst und
						gespeichert. Beispielsweise werden dann folgende Information erfasst:
					</p>
					<ul className="list-disc list-inside space-y-2 ml-6">
						<li>
							aufgerufene Kurse/Nanomodule und die damit verbundenen Verweildauern
						</li>
						<li>Starten, pausieren und anhalten von Videos</li>
						<li>Abgabeversuche von Lernzielkontrollen</li>
					</ul>
					<p>
						Diese Funktion dient deiner persönlichen Analyse und unterstützt dich dabei,
						dein Lernverhalten zu optimieren. Für die folgenden Zwecke werden diese
						Daten verwendet:
						<ul className="list-disc list-inside space-y-2 ml-6">
							<li>
								<span className="font-bold">
									Anzeige von eigenen Lernstatistiken:
								</span>
								<span className="italic">
									{" "}
									Du wirst in Zukunft einen Abschnitt erhalten, in dem du deine
									Informationen einsehen kannst.
								</span>
							</li>
							<li>
								<span className="font-bold">Optimierung der Lernplattform:</span>
								<span className="italic">
									{" "}
									Wir verwenden die Informationen um unsere Plattform weiter zu
									verbessern.
								</span>
							</li>
							<li>
								<span className="font-bold">Personalisierung der Lerninhalte:</span>
								<span className="italic">
									{" "}
									Das Verhalten der Plattform verändert sich möglicherweise, um
									dir ein besseres Erlebnis zu bieten.
								</span>
							</li>
							<li>
								<span className="font-bold">
									Bereitstellung von Daten für Forschungszwecke:
								</span>
								<span className="italic">
									{" "}
									Diese Daten werden pseudo-anonymisiert für Forschungszwecke
									verwendet.
								</span>
							</li>
							<li>
								<span className="font-bold">
									Bereitstellung von aggregierten Daten für Lehrende:
								</span>
								<span className="italic">
									{" "}
									Lehrende erhalten aggregierte Daten mit Übersichten zu den
									eigenen Kursen.
								</span>
							</li>
						</ul>
						Dabei gilt, dass wir deine Informationen gegenüber anderen stets vertraulich
						behandeln und keine Rückschlüsse auf deine Person zulassen. Weiterhin werden
						keine Daten an Dritte weitergegeben und du kannst die gesammelten Daten
						jederzeit löschen.
					</p>
				</ExpandableSettingsSection>
			</div>
			<div className="space-y-2">
				<ToggleSetting
					value={enabledFeatureLearningDiary}
					onChange={onChangeLtb}
					label="Lerntagebuch"
				/>

				<ExpandableSettingsSection
					text="Lernaktivitäten und Lernstrategien dokumentieren"
					title="Check this for learning diary"
				>
					<p>
						Werde mit dem interaktiven Lerntagebuch zur Expert*in deines eigenen
						Lernens! Setze individuelle Ziele und dokumentiere deine Lernaktivitäten
						sowie die Lernstrategien, die du zur Bearbeitung angewendet hast. Verfolge
						deinen Fortschritt anschaulich: Durch die Auswertung deiner Lernstatistiken
						erkennst du schnell, wo deine Stärken liegen und in welchen Bereichen du
						dich optimieren oder verbessern kannst. Basierend auf den Lernstatistiken
						werden dir neue, individuelle Lernpfade vorgeschlagen. Es werden keine Daten
						an Dritte weitergegeben und du kannst die gesammelten Daten jederzeit
						löschen.
					</p>
				</ExpandableSettingsSection>
			</div>
		</div>
	);
}

// Gruppierung der NotificationTypes zu benutzerfreundlichen Settings
const notificationSettingsGroups: Record<
	string, // group key wie "streakReminder", "courseReminder"
	{
		title: string;
		text: string;
		correspondingNotifications: NotificationType[];
	}
> = {
	courseReminder: {
		title: "Kurs-Erinnerungen",
		text: "Erhalte eine Erinnerung, wenn du einen Kurs begonnen hast, aber noch nicht abgeschlossen hast",
		correspondingNotifications: ["courseReminder"]
	},
	streakReminder: {
		title: "Streak-Erinnerungen",
		text: "Erhalte eine Erinnerung, wenn du deine Lernziele für einen Tag nicht erreicht hast",
		correspondingNotifications: ["streakReminderFirst", "streakReminderLast"]
	}
};

// Helper: Bestimmt ob eine Gruppe für einen Channel aktiviert ist
function isGroupEnabled(
	groupKey: string,
	channel: NotificationChannel,
	allSettings: UserNotificationSetting[]
): boolean {
	const group = notificationSettingsGroups[groupKey];
	if (!group) return false;

	// Gruppe ist aktiviert wenn MINDESTENS ein entsprechender NotificationType aktiviert ist
	return group.correspondingNotifications.some(notificationType => {
		const setting = allSettings.find(s => s.type === notificationType && s.channel === channel);
		return setting?.enabled ?? false;
	});
}

export function NotificationSettingsForm({
	notificationSettings,
	onChange
}: {
	notificationSettings: UserNotificationSetting[];
	onChange: OnDialogCloseFn<UserNotificationSetting[]>;
}) {
	const supportedChannels: NotificationChannel[] = ["email"]; // später auch "push"

	const handleGroupToggle = function (
		groupKey: string,
		channel: NotificationChannel,
		newValue: boolean
	): void {
		const group = notificationSettingsGroups[groupKey];
		if (!group) return;

		const updatedSettings: UserNotificationSetting[] = [];

		// Alle NotificationTypes dieser Gruppe für den Channel aktualisieren
		group.correspondingNotifications.forEach(notificationType => {
			const updatedSetting = notificationSettings.find(
				s => s.type === notificationType && s.channel === channel
			);
			if (updatedSetting) {
				updatedSettings.push({
					...updatedSetting,
					enabled: newValue
				});
			}
		});
		onChange(updatedSettings);
	};

	return (
		<div className="space-y-6">
			{Object.entries(notificationSettingsGroups).map(([groupKey, group]) => (
				<div key={groupKey} className="space-y-3">
					<div className="space-y-2">
						<h3 className="font-medium">{group.title}</h3>
						<ExpandableSettingsSection title={group.title} text={group.text} />
					</div>

					{/* Pro Channel ein Toggle */}
					<div className="space-y-2 pl-4">
						{supportedChannels.map(channel => {
							// Prüfen ob für diesen Channel + Gruppe Settings existieren
							const hasSettingsForChannel = group.correspondingNotifications.some(
								notificationType =>
									notificationSettings.some(
										s => s.type === notificationType && s.channel === channel
									)
							);

							if (!hasSettingsForChannel) return null;

							const isEnabled = isGroupEnabled(
								groupKey,
								channel,
								notificationSettings
							);
							const channelLabel = channel === "email" ? "E-Mail" : "Push";

							return (
								<ToggleSetting
									key={`${groupKey}-${channel}`}
									value={isEnabled}
									onChange={(value: boolean) =>
										handleGroupToggle(groupKey, channel, value)
									}
									label={`${group.title} ${channelLabel}`}
								/>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}
