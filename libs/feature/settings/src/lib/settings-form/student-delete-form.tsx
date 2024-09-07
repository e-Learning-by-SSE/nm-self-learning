import { trpc } from "@self-learning/api-client";
import {
	DialogHandler,
	dispatchDialog,
	freeDialog,
	QuestionMarkTooltip,
	showToast,
	Tooltip
} from "@self-learning/ui/common";
import { redirectToLogin, useRequiredSession } from "@self-learning/ui/layouts";
import {
	StudentAllDeleteInfoDialog,
	StudentDeleteDialog,
	StudentDeleteInfoDialog
} from "../settings-dialog/student-delete-dialog";

export function StudentDeleteForm() {
	const { mutateAsync: deleteOnlyMe } = trpc.me.deleteMe.useMutation();
	const session = useRequiredSession();
	const user = session.data?.user;
	if (!user) {
		return null;
	}

	const afterPersonalDeleteInfoDialog = () => {
		freeDialog("student-delete-form");
		dispatchDialog(
			<StudentDeleteDialog
				user={{ ...user, id: "" }}
				onClose={async accepted => {
					if (accepted) {
						try {
							const success = await deleteOnlyMe();
							if (success) {
								showToast({
									type: "success",
									title: "Account gelöscht",
									subtitle: "Sie wurden erfolgreich abgemeldet."
								});
							}
							redirectToLogin();
						} catch (error) {
							showToast({
								type: "error",
								title: "Account konnte nicht gelöscht werden",
								subtitle: "Bitte versuchen Sie es erneut."
							});
						}
					}
					freeDialog("student-delete-form");
				}}
			/>,
			"student-delete-form"
		);
	};

	const afterAllDeleteInfoDialog = () => {
		freeDialog("student-delete-form");
	};

	return (
		<div className="mt-8 rounded-lg border border-red-300 bg-red-50 p-6">
			<h2 className="text-lg font-bold text-red-700">⚠️ Danger Zone</h2>
			<p className="mt-2 text-sm text-red-600">
				Sei vorsichtig! Diese Aktionen können nicht rückgängig gemacht werden.
			</p>
			<DialogHandler id="student-delete-form" />

			<div className="mt-6 flex flex-col gap-4">
				<div className="flex items-center gap-2">
					<button
						className="btn rounded-full bg-red-500 p-2 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300"
						title="Userdaten löschen"
						onClick={() => {
							dispatchDialog(
								<StudentDeleteInfoDialog
									onClose={() => {
										freeDialog("student-delete-form");
										afterPersonalDeleteInfoDialog();
									}}
								/>,
								"student-delete-form"
							);
						}}
					>
						Userdaten löschen
					</button>
					<PersonalDataTooltip />
				</div>

				<div className="flex items-center gap-2">
					<button
						className="btn rounded-full bg-red-500 p-2 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300"
						title="Alle Daten löschen"
						onClick={() => {
							dispatchDialog(
								<StudentAllDeleteInfoDialog
									onClose={() => {
										freeDialog("student-delete-form");
										afterAllDeleteInfoDialog();
									}}
								/>,
								"student-delete-form"
							);
						}}
					>
						Alle Daten löschen
					</button>
					<AllDataTooltip />
				</div>
			</div>
		</div>
	);
}

const personalDataDeletionInfo = [
	"profile information",
	"account settings",
	"saved preferences",
	"skill repositorys"
];

const allDataDeletionInfo = [...personalDataDeletionInfo, "created courses", "created lessons"];

function generateDeletionTooltip(deletionInfo: string[]): string {
	return `This will delete the following: ${deletionInfo.join(", ")}.`;
}

export function PersonalDataTooltip() {
	const personalDataTitle = generateDeletionTooltip(personalDataDeletionInfo);

	return (
		<Tooltip title={personalDataTitle}>
			<QuestionMarkTooltip tooltipText="Here you can delete your personal data." />
		</Tooltip>
	);
}

function AllDataTooltip() {
	const allDataTitle = generateDeletionTooltip(allDataDeletionInfo);

	return (
		<Tooltip title={allDataTitle}>
			<QuestionMarkTooltip tooltipText="Here you can delete all your data." />
		</Tooltip>
	);
}
