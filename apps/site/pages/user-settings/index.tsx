import { getAuthenticatedUser } from "@self-learning/api";
import { StudentSettings } from "@self-learning/types";
import { Dialog, DialogActions } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { GetServerSideProps } from "next";
import { useState } from "react";
import { database } from "@self-learning/database";
import { trpc } from "@self-learning/api-client";

interface Props {
	learningStatistics: boolean;
	hasLearningDiary: boolean;
	username: string;
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
			hasLearningDiary: settings?.hasLearningDiary ?? false,
			username: user.name
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

function StudentSettingsDialog(initialSettings: StudentSettings) {
	const [settings, setSettings] = useState(initialSettings);

	const onSave = () => {
		//TODO Save settings
	};

	const onChange = (checkbox: string, value: boolean) => {
		setSettings({ ...settings, [checkbox]: value });
	}

	return (
		<Dialog
			style={{ height: "50vh", width: "60vw", overflow: "auto" }}
			title={"Einstellungen"}
			onClose={() => {}}
		>
			<div className="overflow">
				<StudentSettingsForm
					{...settings}
					onChange={onChange}
				/>
			</div>
			<div className="absolute right-4 bottom-5">
			<DialogActions onClose={() => {}}>
				<button className="btn-primary" onClick={() => {

				}}>
					Speichern
				</button>
			</DialogActions>
			</div>
		</Dialog>
	);
}

function StudentSettingPage(initialSettings: StudentSettings) {
	const [settings, setSettings] = useState(initialSettings);
	const { mutateAsync: updateSettings } = trpc.settings.updateSettings.useMutation();

	const onSave = async () => {
		await updateSettings({
			username: initialSettings.username,
			settings
		});
	};

	const onChange = (checkbox: string, value: boolean) => {
		setSettings({ ...settings, [checkbox]: value });
	}

	return (
		<>
			<h1 className="text-2xl font-bold">Einstellungen</h1>
			<StudentSettingsForm {...settings} onChange={onChange} />
				<div className="flex justify-end gap-2 mt-4">
			<button className="btn-primary" onClick={onSave}>
					Speichern
			</button>
			</div>
		</>
	);
}

function StudentSettingsForm({
	learningStatistics,
	hasLearningDiary,
	onChange
}: {
	learningStatistics: boolean;
	hasLearningDiary: boolean;
	onChange: (checkbox: string, value: boolean) => void;
}) {

	const onCheckboxChange = (checkbox: string, value: boolean) => {
		onChange(checkbox, value);
	};

	return (
		<div>
			<h2 className="mt-4 text-lg font-bold">Lernen</h2>
			<div className="mt-6 flex items-center gap-2">
				<input
					type={"checkbox"}
					className="checkbox"
					id="learningStatistics"
					name="learningStatistics"
					checked={learningStatistics}
					onChange={e => {
						onCheckboxChange("learningStatistics", e.target.checked);
					}}
				/>
				<label htmlFor="learningStatistics">Lernstatistiken</label>
			</div>
			<section className="mt-5 rounded-lg bg-white p-3.5">
				<span className="mt-5 h-32 w-full" title="Check this for learning statistics">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
					tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
					vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
					no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
					amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
					labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
					et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
					sanctus est Lorem ipsum dolor sit amet.
				</span>
			</section>
			<div className="mt-4 flex items-center gap-2">
				<input
					type={"checkbox"}
					className="checkbox"
					id="learningDiary"
					name="learningDiary"
					checked={hasLearningDiary}
					onChange={e => {
						onCheckboxChange("hasLearningDiary", e.target.checked);
					}}
				/>
				<label htmlFor="learningDiary">Lerntagebuch</label>
			</div>
			<section className="mt-5 rounded-lg bg-white p-3.5">
				<span className="mt-5 h-32 w-full" title="Check this for learningdiary">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
					tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
					vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
					no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
					amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
					labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
					et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
					sanctus est Lorem ipsum dolor sit amet.
				</span>
			</section>
		</div>
	);
}
