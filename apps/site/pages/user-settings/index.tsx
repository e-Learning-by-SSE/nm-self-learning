import { withAuth, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import {
	DeleteMeForm,
	FeatureSettingsForm,
	getUserWithSettings,
	PersonalSettingsForm,
	I18N_NAMESPACE as NS_SETTINGS
} from "@self-learning/settings";
import { ResolvedValue } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState } from "react";

interface PageProps {
	settings: NonNullable<ResolvedValue<typeof getUserWithSettings>>;
}

export const getServerSideProps = withTranslations(
	Array.from(new Set(["common", "pages-settings", ...NS_SETTINGS])),
	withAuth<PageProps>(async (_context, user) => {
		const settings = await getUserWithSettings(user.name);

		if (!settings) {
			return {
				notFound: true
			};
		}

		return {
			props: {
				settings
			}
		};
	})
);

export default function SettingsPage(props: PageProps) {
	const [settings, setSettings] = useState(props.settings);
	const { mutateAsync: updateSettings } = trpc.me.updateSettings.useMutation();
	const { t: t_common } = useTranslation("common");
	const { t } = useTranslation("pages-settings");

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

			setSettings(prev => {
				const newSettings = { ...prev, ...update };
				updateSettings({ user: newSettings });
				return newSettings;
			});
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

	console.log("settings", settings);
	return (
		<CenteredSection className="bg-gray-50">
			<h1 className="text-2xl font-bold">{t_common("Settings")}</h1>
			<SettingSection title={t_common("Profile")}>
				<PersonalSettingsForm
					personalSettings={settings}
					onSubmit={onPersonalSettingSubmit}
				/>
			</SettingSection>
			<SettingSection title={t("Feature_other")}>
				<FeatureSettingsForm featureSettings={settings} onChange={onFeatureChange} />
			</SettingSection>
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
