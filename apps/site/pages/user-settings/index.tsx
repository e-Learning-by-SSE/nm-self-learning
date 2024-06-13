import { getAuthenticatedUser } from "@self-learning/api";
import { StudentSettings } from "@self-learning/types";
import { StudentSettingsForm } from "@self-learning/settings";
import { CenteredSection } from "@self-learning/ui/layouts";
import { GetServerSideProps } from "next";
import { useState } from "react";
import { database } from "@self-learning/database";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";

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

	const onSave = async () => {
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
	};

	const onChange = (checkbox: string, value: boolean) => {
		setSettings({ ...settings, [checkbox]: value });
	};

	return (
		<>
			<h1 className="text-2xl font-bold">Einstellungen</h1>
			<StudentSettingsForm {...settings} onChange={onChange} />
			<div className="mt-4 flex justify-end gap-2">
				<button className="btn-primary" onClick={onSave}>
					Speichern
				</button>
			</div>
		</>
	);
}
