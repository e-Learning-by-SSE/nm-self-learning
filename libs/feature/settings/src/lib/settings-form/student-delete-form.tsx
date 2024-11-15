import { trpc } from "@self-learning/api-client";
import {
	Dialog,
	DialogActions,
	DialogHandler,
	dispatchDialog,
	freeDialog,
	ImageOrPlaceholder,
	QuestionMarkTooltip,
	showToast,
	Tooltip
} from "@self-learning/ui/common";
import { CenteredContainer, redirectToLogin, useRequiredSession } from "@self-learning/ui/layouts";
import { AuthorSvg, DiarySvg, StatisticSvg } from "@self-learning/ui/static";
import { Session } from "next-auth";
import { useState } from "react";

export function StudentDeleteForm() {
	const { mutateAsync: deleteMe } = trpc.me.delete.useMutation();
	const session = useRequiredSession();
	const user = session.data?.user;
	if (!user) return null;

	const afterPersonalDeleteInfoDialog = () => {
		freeDialog("student-delete-form");
		dispatchDialog(
			<StudentDeleteDialog
				user={{ ...user }}
				onClose={async accepted => {
					if (accepted) {
						try {
							const success = await deleteMe();
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
			<h2 className="text-lg font-bold text-red-700">
				{" "}
				<span role="img" aria-label="Warning">
					⚠️
				</span>{" "}
				Danger Zone
			</h2>
			<p className="mt-2 text-sm text-red-600">
				Sei vorsichtig! Diese Aktionen können nicht rückgängig gemacht werden.
			</p>
			<DialogHandler id="student-delete-form" />

			<div className="mt-6 flex flex-col gap-4">
				<div className="flex items-center gap-2">
					<button
						className="btn rounded-full bg-red-500 p-2 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300"
						title="Nutzerdaten löschen"
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
				</div>
			</div>
		</div>
	);
}


function StudentDeleteDialog({
	user,
	onClose
}: {
	user: Session["user"];
	onClose: (accepted: boolean) => void;
}) {
	const [userTyped, setUserTyped] = useState("");

	return (
		<CenteredContainer>
			<Dialog
				style={{
					height: "35vh",
					width: "35vw",
					overflow: "auto",
					minHeight: "200px",
					minWidth: "300px"
				}}
				title={"Delete Student"}
				onClose={() => {
					onClose(false);
				}}
			>
				<CenteredContainer>
					<div>
						Bist du die sicher {user.name} zu löschen? Zum Bestätigen bitte den Namen
						des Accounts eingeben.
					</div>
					<div>
						<input
							className="textfield mt-5"
							type="text"
							placeholder={user.name ?? "Student's name"}
							onChange={value => {
								setUserTyped(value.target.value);
							}}
						/>
					</div>
				</CenteredContainer>
				<div className="mt-auto">
					<DialogActions
						onClose={() => {
							onClose(false);
						}}
					>
						<button
							className={`btn ${
								userTyped !== user.name ? "disabled bg-red-500" : "bg-secondary"
							}`}
							onClick={() => {
								const accepted = userTyped === user.name;
								if (!accepted) {
									return;
								}
								onClose(accepted);
							}}
						>
							{userTyped !== user.name ? "Blockiert" : "OK"}
						</button>
					</DialogActions>
				</div>
			</Dialog>
		</CenteredContainer>
	);
}

function StudentDeleteInfoDialog({ onClose }: { onClose: () => void }) {
	const session = useRequiredSession();
	const user = session.data?.user;
	return (
		<CenteredContainer>
			<Dialog
				style={{
					height: "80vh",
					width: "35vw",
					minHeight: "200px",
					minWidth: "300px"
				}}
				title={"Delete Student"}
				onClose={onClose}
			>
				<CenteredContainer className="overflow-auto">
					<div className="flex min-h-screen flex-col items-center space-y-6 bg-gray-50 p-6">
						<h2 className="text-xl font-semibold text-gray-800">Was wird gelöscht?</h2>

						<div className="relative flex w-full items-center">
							<div className="flex w-full items-center">
								<div className="flex-1 rounded-lg border bg-white p-4 shadow">
									<p className="text-gray-700">
										<strong>
											Nach dieser Aktion gibt es keine Rückschlüsse mehr auf
											deinen Namen.
										</strong>
									</p>
								</div>
							</div>
						</div>

						<div className="h-10 border-l-2 border-gray-300"></div>

						<div className="relative flex w-full items-center">
							<div className="flex w-full items-center">
								<div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-gray-200">
									<ImageOrPlaceholder
										src={user?.avatarUrl ?? undefined}
										className="h-16 w-16 rounded-full object-cover"
									/>
								</div>
								<div className="flex-1 rounded-lg border bg-white p-4 shadow">
									<p className="text-gray-600">
										Folgende Daten werden gelöscht: Account Informationen,
										Präferenzen und Einstellungen, sowie sämtliche Daten die eng
										mit dem Account verknüpft sind.
									</p>
								</div>
							</div>
						</div>

						<div className="h-10 border-l-2 border-gray-300"></div>

						<div className="relative flex w-full items-center">
							<div className="flex w-full items-center">
								<div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-gray-200">
									<DiarySvg className="h-16 w-16 rounded-full" />
								</div>
								<div className="flex-1 rounded-lg border bg-white p-4 shadow">
									<p className="text-gray-600">
										Learntagebuch, sowie alle Lernfortschritte werden gelöscht.
									</p>
								</div>
							</div>
						</div>

						<div className="h-10 border-l-2 border-gray-300"></div>

						<div className="relative flex w-full items-center">
							<div className="flex w-full items-center">
								<div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-gray-200">
									<StatisticSvg className="h-16 w-16 rounded-full" />
								</div>
								<div className="flex-1 rounded-lg border bg-white p-4 shadow">
									<p className="text-gray-600">Außerdem alle Statistiken</p>
								</div>
							</div>
						</div>

						<div className="h-10 border-l-2 border-gray-300"></div>

						<h2 className="text-xl font-semibold text-gray-800">
							Was bleibt in der Plattform?
						</h2>

						<div className="relative flex w-full items-center">
							<div className="flex w-full items-center">
								<div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-gray-200">
									<AuthorSvg className="h-16 w-16 rounded-full" />
								</div>
								<div className="flex-1 rounded-lg border bg-white p-4 shadow">
									<p className="text-gray-600">
										Dein Autorenprofil bleibt bestehen.
									</p>
								</div>
							</div>
						</div>

						<div className="h-10 border-l-2 border-gray-300"></div>

						<div className="relative flex w-full items-center">
							<div className="flex w-full items-center">
								<div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-gray-200">
									{/* Placeholder for Image or Icon */}
								</div>
								<div className="flex-1 rounded-lg border bg-white p-4 shadow">
									<p className="text-gray-600">
										Sämtliche erstellen Kurse und Lerneinheiten bleiben
										erhalten. Das beinhaltet auch erstellte Skillrepositories.
									</p>
								</div>
							</div>
						</div>

						<div className="h-10 border-l-2 border-gray-300"></div>

						<div className="relative flex w-full items-center">
							<div className="flex-1 rounded-lg border bg-slate-200 p-4 shadow">
								<span className="text-gray-700">
									<strong>Wichtig! </strong> <br />
									Erstellte Kurse und Lerneinheiten bleiben erhalten. Möchtest du
									diese löschen, klicke auf den Button "Alle Daten löschen".
								</span>
							</div>
						</div>
					</div>
				</CenteredContainer>
				<div>
					<DialogActions onClose={onClose}>
						<button className="btn-primary" onClick={onClose}>
							Weiter
						</button>
					</DialogActions>
				</div>
			</Dialog>
		</CenteredContainer>
	);
}

function StudentAllDeleteInfoDialog({ onClose }: { onClose: () => void }) {
	return (
		<CenteredContainer>
			<Dialog
				style={{
					height: "30vh",
					width: "35vw",
					minHeight: "150px",
					minWidth: "300px"
				}}
				title={"Delete Student"}
				onClose={onClose}
			>
				<CenteredContainer>
					<div>
						<div className="flex items-center overflow-auto">
							<span>
								Es werden alle Daten inklusive der erstellen Kurse und Lerneinheiten
								gelöscht
								<br />
								Wenden sie sich an den Systemadministrator um ihre gesamten Daten zu
								löschen
							</span>
						</div>
					</div>
				</CenteredContainer>
				<div className="absolute bottom-5 right-5">
					<DialogActions
						onClose={() => {
							if (onClose) {
								onClose();
							}
						}}
					>
						<button className="btn-primary" onClick={onClose}>
							Weiter
						</button>
					</DialogActions>
				</div>
			</Dialog>
		</CenteredContainer>
	);
}
