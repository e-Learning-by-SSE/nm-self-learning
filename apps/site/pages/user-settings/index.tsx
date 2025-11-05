import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import {
	DeleteMeForm,
	EXPERIMENT_END_DATE,
	ExperimentShortInfo,
	FeatureSettingsForm,
	getExperimentStatus,
	getUserWithSettings,
	isExperimentActive,
	NotificationSettingsForm,
	PersonalSettingsForm,
	I18N_NAMESPACE as NS_SETTINGS
} from "@self-learning/profile";
import { ResolvedValue } from "@self-learning/types";
import { showToast, Toggle } from "@self-learning/ui/common";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { useLoginRedirect, withAuth } from "@self-learning/util/auth";
import { isTruthy } from "@self-learning/util/common";
import { TRPCClientError } from "@trpc/client";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState } from "react";

interface PageProps {
	settings: NonNullable<ResolvedValue<typeof getUserWithSettings>>;
	experimentStatus: NonNullable<ResolvedValue<typeof getExperimentStatus>>;
}

export const getServerSideProps = withTranslations(
	Array.from(new Set(["common", "pages-settings", ...NS_SETTINGS])),
	withAuth<PageProps>(async (_context, user) => {
		const settings = await getUserWithSettings(user.name);
		const experimentStatus = await getExperimentStatus(user.name);

		if (!settings) {
			return {
				notFound: true
			};
		}

		return {
			props: {
				settings,
				experimentStatus
			}
		};
	})
);

export default function SettingsPage(props: PageProps) {
	const [settings, setSettings] = useState(props.settings);
	const [hasSettingsChanged, setHasSettingsChanged] = useState(false);

	const { mutateAsync: updateUser } = trpc.me.update.useMutation();
	const { mutateAsync: updateFeatures } = trpc.me.updateFeatureFlags.useMutation();
	const { mutateAsync: updateNotificationSettings } =
		trpc.notification.upsertNotificationSetting.useMutation();

	const { data } = useRequiredSession();
	const { t: t_common } = useTranslation("common");
	const { t } = useTranslation("pages-settings");

	const router = useRouter();
	const { data: session } = useRequiredSession();

	const { loginRedirect } = useLoginRedirect();

	const onPersonalSettingSubmit: Parameters<
		typeof PersonalSettingsForm
	>[0]["onSubmit"] = async update => {
		if (!update) return;
		try {
			setSettings(prev => {
				const newSettings = { ...prev, ...update };
				void updateUser({ user: newSettings });
				return newSettings;
			});
			setHasSettingsChanged(true);
			showToast({
				type: "success",
				title: t_common("Information Updated"),
				subtitle: update.displayName
			});
			router.replace(router.asPath);
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: t_common("Error"), subtitle: error.message });
			}
		}
	};

	const onFeatureChange: Parameters<typeof FeatureSettingsForm>[0]["onChange"] = async update => {
		try {
			if (!update) return;
			// TODO [MS-MA]: remove this check when the feature is stable
			if (
				"learningStatistics" in update &&
				update.learningStatistics === false &&
				data?.user.featureFlags.experimental
			) {
				showToast({
					type: "error",
					title: "Aktion nicht möglich",
					subtitle:
						"Diese Einstellung kann nicht deaktiviert während du an einer Studie teilnimmst."
				});
				return;
			}
			setSettings(prev => {
				const newFeatureFlags = { ...prev.featureFlags, ...update };
				const newSettings = { ...prev, featureFlags: newFeatureFlags };

				void updateFeatures(update);
				return newSettings;
			});
			setHasSettingsChanged(true);
		} catch (error) {
			if (error instanceof Error) {
				showToast({
					type: "error",
					title: t_common("Settings Could not be Saved!"),
					subtitle: error.message ?? ""
				});
			}
		}
	};

	const onNotificationChange: Parameters<
		typeof NotificationSettingsForm
	>[0]["onChange"] = async update => {
		if (!update || (Array.isArray(update) && update.length === 0)) return;

		const updatesArray = Array.isArray(update) ? update : [update];

		setSettings(prev => {
			const newSettings = [...prev.notificationSettings];

			updatesArray.forEach(singleUpdate => {
				const index = newSettings.findIndex(s => s.id === singleUpdate.id);
				if (index >= 0) {
					newSettings[index] = { ...newSettings[index], ...singleUpdate };
				}
			});

			return { ...prev, notificationSettings: newSettings };
		});
		console.log("Updating notification settings", updatesArray);
		const fullUpdates = updatesArray
			.map(singleUpdate => ({
				...settings.notificationSettings.find(s => s.id === singleUpdate.id),
				...singleUpdate
			}))
			.filter(isTruthy);
		console.log("Updating notification settings", fullUpdates);
		await updateNotificationSettings(fullUpdates);
		setHasSettingsChanged(true);
	};

	return (
		<CenteredSection className="bg-gray-50">
			<h1 className="text-2xl font-bold">{t_common("Settings")}</h1>

			{hasSettingsChanged ? (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-blue-800 text-sm font-medium">
								Einstellungen aktualisiert
							</p>
							<p className="text-blue-600 text-sm">
								Einige Einstellungen werden erst nach einem erneuten Login aktiv.
							</p>
						</div>
						<button
							onClick={() => loginRedirect("/user-settings")}
							className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
						>
							Neu einloggen
						</button>
					</div>
				</div>
			) : (
				<p className="text-gray-600 text-sm mb-4">
					Einige Einstellungen werden möglicherweise erst nach einem erneuten Login aktiv.
				</p>
			)}

			<SettingSection title={t_common("Profile")}>
				<PersonalSettingsForm
					personalSettings={settings}
					onSubmit={onPersonalSettingSubmit}
				/>
			</SettingSection>
			<SettingSection title={t("Feature_other")}>
				<FeatureSettingsForm
					featureSettings={settings.featureFlags}
					onChange={onFeatureChange}
				/>
			</SettingSection>
			<SettingSection title="Benachrichtigungen">
				{props.experimentStatus?.experimentalFeatures && (
					<NotificationSettingsForm
						notificationSettings={settings.notificationSettings}
						onChange={onNotificationChange}
					/>
				)}
			</SettingSection>
			<SettingSection title="Studienteilnahme">
				{props.experimentStatus?.isParticipating && (
					<ExperimentShortInfo {...props.experimentStatus} />
				)}

				{!props.experimentStatus?.isParticipating && isExperimentActive() && (
					<ExperimentShortInfo {...props.experimentStatus} />
				)}
			</SettingSection>
			{session?.user.role === "ADMIN" && (
				<SettingSection title={t("Developer Options")}>
					<Toggle
						value={props.experimentStatus?.isParticipating ?? false}
						onChange={newValue => {
							/* TODO */
							console.log(
								`attempt to set experiment status to ${newValue} but not implemented yet`
							);
						}}
						label="Experimentteilnahme mit Beta-Features (Gamification)"
						disabled={isExperimentActive()} // avoid interference with ongoing experiments
					/>
				</SettingSection>
			)}

			<SettingSection title={t("Critical Area")}>
				<DeleteMeForm />
			</SettingSection>
		</CenteredSection>
	);
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="space-y-4 mt-8 rounded-lg border bg-gray-100 p-6">
			<h3>{title}</h3>
			{children}
		</section>
	);
}
