import { getAuthenticatedUser } from "@self-learning/api";
import { StudentSettings } from "@self-learning/types";
import { DeleteMeForm, FeatureSettingsForm, PersonalSettingsForm } from "@self-learning/settings";
import { CenteredSection } from "@self-learning/ui/layouts";
import { GetServerSideProps } from "next";
import { useCallback, useEffect, useState } from "react";
import { database } from "@self-learning/database";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { useRouter } from "next/router";
import { TRPCClientError } from "@trpc/client";

interface Props {
	learningStatistics: boolean;
	hasLearningDiary: boolean;
}

async function getStudentSettings(username: string) {
	return database.studentSettings.findFirst({
		where: {
			username
		}
	});
}

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
	const user = await getAuthenticatedUser(ctx);
	if (!user || !user.name) {
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};
	}
	const settings = await getStudentSettings(user.name);

	return {
		props: {
			learningStatistics: settings?.learningStatistics ?? false,
			hasLearningDiary: settings?.hasLearningDiary ?? false
		}
	};
};

export default function Start(props: Props) {
	return (
		<CenteredSection className="bg-gray-50">
			<StudentSettingPage {...props} />
		</CenteredSection>
	);
}

function StudentSettingPage(initialSettings: StudentSettings) {
	const [settings, setSettings] = useState(initialSettings);
	const { mutateAsync: updateSettings } = trpc.settings.updateSettings.useMutation();
	const { mutateAsync: updateStudent } = trpc.me.updateStudent.useMutation();
	const router = useRouter();

	const onSave = useCallback(async () => {
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
	}, [settings, updateSettings]);

	const onChange = async (checkbox: string, value: boolean) => {
		const newSettings = { ...settings, [checkbox]: value };
		// Automatically disable learning diary if learning statistics are disabled
		if (checkbox === "learningStatistics" && value === false) {
			newSettings.hasLearningDiary = false;
		}
		setSettings(newSettings);
	};

	const onProfileUpdateSubmit: Parameters<
		typeof PersonalSettingsForm
	>[0]["onSubmit"] = async updated => {
		if (updated) {
			try {
				await updateStudent(updated);
				showToast({
					type: "success",
					title: "Informationen aktualisiert",
					subtitle: updated.user.displayName
				});
				router.replace(router.asPath);
			} catch (error) {
				console.error(error);

				if (error instanceof TRPCClientError) {
					showToast({ type: "error", title: "Fehler", subtitle: error.message });
				}
			}
		}
	};

	useEffect(() => {
		onSave();
	}, [onSave, settings]);

	return (
		<>
			<h1 className="text-2xl font-bold">Einstellungen</h1>
			<SettingSection title="Profil">
				<PersonalSettingsForm
					student={{ user: { displayName: "Max Mustermann" } }}
					onSubmit={onProfileUpdateSubmit}
				/>
			</SettingSection>
			<SettingSection title="Funktionen">
				<FeatureSettingsForm {...settings} onChange={onChange} />
			</SettingSection>
			<SettingSection title="Kritischer Bereich">
				<DeleteMeForm />
			</SettingSection>
		</>
	);
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="space-y-4 mt-8 rounded-lg border border-slate-400 bg-white p-6">
			<h3>{title}</h3>
			{children}
		</section>
	);
}
