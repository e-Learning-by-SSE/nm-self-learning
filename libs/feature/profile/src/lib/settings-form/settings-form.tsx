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
import { OnDialogCloseFn, Toggle, Trans } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useForm } from "react-hook-form";
import { getUserWithSettings } from "../crud-settings";
import { useTranslation } from "next-i18next";
import { ExpandableSettingsSection } from "./setting-section";

function ToggleSetting({
	value,
	onChange,
	label,
	testid
}: {
	value: boolean;
	onChange: (value: boolean) => void;
	label: string;
	testid?: string;
}) {
	return (
		<div className="flex items-center gap-2">
			<Toggle value={value} onChange={onChange} label={label} testid={testid} />
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
	const { t: t_common } = useTranslation("common");
	const { t } = useTranslation("feature-settings");

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
			<LabeledField
				label={t_common("Name")}
				error={form.formState.errors.displayName?.message}
			>
				<input {...form.register("displayName")} type="text" className="textfield" />
			</LabeledField>
			<LabeledField label={t_common("Email")}>
				<input
					type="email"
					disabled
					className="textfield "
					value={
						personalSettings.email ??
						t("You will soon be able to enter your email address here.")
					}
				/>
			</LabeledField>

			<button className="btn-primary" disabled={!form.formState.isValid}>
				{t("Save Profile")}
			</button>
		</form>
	);
}

export function FeatureSettingsForm({
	featureSettings,
	onChange
}: {
	featureSettings: { learningDiary: boolean; learningStatistics: boolean };
	onChange: OnDialogCloseFn<EditFeatureSettings>;
}) {
	const { learningDiary, learningStatistics } = featureSettings;

	const onChangeLtb = (value: boolean) => {
		if (value) {
			onChange({ learningDiary: true, learningStatistics: true });
		}
		onChange({ learningDiary: value });
	};

	const onChangeStatistics = (value: boolean) => {
		if (!value) {
			onChange({ learningStatistics: false, learningDiary: false });
		}
		onChange({ learningStatistics: value });
	};

	const { t: t_common } = useTranslation("common");
	const { t: t_tou } = useTranslation("terms-of-use");
	const { t: t_feature } = useTranslation("feature-settings");

	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<ToggleSetting
					value={learningStatistics}
					onChange={onChangeStatistics}
					label={t_common("Learning-Statistics_other")}
					testid="statistics-toggle"
				/>

				<ExpandableSettingsSection
				    title={t_tou("Learning Statistics - Terms of Use - Hoover Text")}
					text={t_tou("Learning Statistics - Terms of Use - Title")}
				>
					<Trans namespace="terms-of-use" i18nKey="Learning Statistics - Terms of Use" />
				</ExpandableSettingsSection>
			</div>
			<div className="space-y-2">
				<ToggleSetting value={learningDiary} onChange={onChangeLtb} label={t_common("Learning-Diary")}
					testid="ltb-toggle" />
					<ExpandableSettingsSection
				    title={t_tou("Learning-Diary - Terms of Use - Hoover Text")}
					text={t_tou("Learning-Diary - Terms of Use - Title")}
				>
					<Trans namespace="terms-of-use" i18nKey="Learning-Diary - Terms of Use" />
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
