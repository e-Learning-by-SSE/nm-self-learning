import { getAuthenticatedUser } from "@self-learning/api";
import { StudentSettings } from "@self-learning/types";
import { StudentDeleteForm, StudentSettingsForm } from "@self-learning/settings";
import { CenteredSection } from "@self-learning/ui/layouts";
import { GetServerSideProps } from "next";
import { useCallback, useEffect, useState } from "react";
import { database } from "@self-learning/database";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { useSession } from "next-auth/react";

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
			<StudentDeleteForm />
		</CenteredSection>
	);
}

function StudentSettingPage(initialSettings: StudentSettings) {
	const [settings, setSettings] = useState(initialSettings);
	const { mutateAsync: updateSettings } = trpc.settings.updateSettings.useMutation();
	const { data: session, update } = useSession();

	const onSave = useCallback(async () => {
		try {
			await updateSettings({
				settings
			});
			const updatedSession = {
				...session,
				user: {
					...session?.user,
					eventLogEnabled: settings.learningStatistics
				}
			};
			update(updatedSession);
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
		setSettings({ ...settings, [checkbox]: value });
		onSave();
	};

	useEffect(() => {
		onSave();
	}, [onSave, settings]);

	return (
		<>
			<h1 className="text-2xl font-bold">Einstellungen</h1>
			<StudentSettingsForm {...settings} onChange={onChange} />
		</>
	);
}
