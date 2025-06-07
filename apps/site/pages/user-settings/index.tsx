import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import {
	DeleteMeForm,
	ExperimentShortInfo,
	FeatureSettingsForm,
	getExperimentStatus,
	getUserWithSettings,
	NotificationSettingsForm,
	PersonalSettingsForm
} from "@self-learning/profile";
import { ResolvedValue } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { withAuth } from "@self-learning/util/auth";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/router";
import { useState } from "react";

interface PageProps {
	settings: NonNullable<ResolvedValue<typeof getUserWithSettings>>;
	experimentStatus: NonNullable<ResolvedValue<typeof getExperimentStatus>>;
}

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<PageProps>(async (context, user) => {
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
	const { mutateAsync: updateSettings } = trpc.me.updateSettings.useMutation();
	const { data } = useRequiredSession();
	const router = useRouter();

	const onPersonalSettingSubmit: Parameters<
		typeof PersonalSettingsForm
	>[0]["onSubmit"] = async update => {
		if (!update) return;
		try {
			setSettings(prev => {
				const newSettings = { ...prev, ...update };
				updateSettings({ user: newSettings });
				return newSettings;
			});
			showToast({
				type: "success",
				title: "Informationen aktualisiert",
				subtitle: update.displayName
			});
			router.replace(router.asPath);
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: "Fehler", subtitle: error.message });
			}
		}
	};

	type OnChangeType = Parameters<typeof FeatureSettingsForm>[0]["onChange"] &
		Parameters<typeof NotificationSettingsForm>[0]["onChange"];

	const onFeatureChange: OnChangeType = async update => {
		try {
			if (!update) return;
			// TODO [MS-MA]: remove this check when the feature is stable
			if (
				"enabledFeatureLearningDiary" in update &&
				update.enabledLearningStatistics === false &&
				data?.user.features.includes("experimentalFeatures")
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
				const newSettings = { ...prev, ...update };
				updateSettings({ user: newSettings });
				return newSettings;
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
	};
	return (
		<CenteredSection className="bg-gray-50">
			<h1 className="text-2xl font-bold">Einstellungen</h1>
			<p className="text-gray-600 text-sm">
				Einige Einstellungen werden möglicherweise erst nach einem erneuten Login aktiv.
			</p>
			<SettingSection title="Profil">
				<PersonalSettingsForm
					personalSettings={settings}
					onSubmit={onPersonalSettingSubmit}
				/>
			</SettingSection>
			<SettingSection title="Funktionen">
				<FeatureSettingsForm featureSettings={settings} onChange={onFeatureChange} />
			</SettingSection>
			<SettingSection title="Benachrichtigungen">
				{props.experimentStatus?.isParticipating && (
					<NotificationSettingsForm
						notificationSettings={settings.notificationSettings}
						onChange={onFeatureChange}
					/>
				)}
			</SettingSection>
			<SettingSection title="Studienteilnahme">
				{props.experimentStatus && <ExperimentShortInfo {...props.experimentStatus} />}
			</SettingSection>
			<SettingSection title="Kritischer Bereich">
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
