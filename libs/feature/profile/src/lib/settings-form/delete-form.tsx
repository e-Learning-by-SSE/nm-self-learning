"use client";
import { trpc } from "@self-learning/api-client";
import {
	Dialog,
	DialogActions,
	DialogHandler,
	dispatchDialog,
	freeDialog,
	ImageOrPlaceholder,
	showToast
} from "@self-learning/ui/common";
import { CenteredContainer, useRequiredSession } from "@self-learning/ui/layouts";
import { AuthorSvg, DiarySvg, StatisticSvg } from "@self-learning/ui/static";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useState } from "react";

export function DeleteMeForm() {
	const router = useRouter();
	const { mutateAsync: deleteMe } = trpc.me.delete.useMutation();
	const session = useRequiredSession();
	const user = session.data?.user;
	if (!user) return null;

	const afterPersonalDeleteInfoDialog = () => {
		freeDialog("student-delete-form");
		dispatchDialog(
			<DeleteMeDialog
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
							router.push("/");
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
		// open mailto here
	};

	return (
		<>
			<p className="mt-2 text-sm">
				<span role="img" aria-label="Warning">
					⚠️
				</span>{" "}
				Sei vorsichtig! Diese Aktionen können nicht rückgängig gemacht werden.
			</p>
			<DialogHandler id="student-delete-form" />

			<div className="mt-6 flex flex-col gap-4">
				<button
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
					className="btn btn-danger w-full max-w-52"
				>
					Nutzerdaten löschen
				</button>

				<button
					onClick={() => {
						dispatchDialog(
							<AuthorDeleteDialog
								onClose={() => {
									freeDialog("student-delete-form");
									afterAllDeleteInfoDialog();
								}}
							/>,
							"student-delete-form"
						);
					}}
					disabled={!user.isAuthor}
					className="btn btn-danger w-full max-w-52"
				>
					Autorenprofil löschen
				</button>
			</div>
		</>
	);
}

function DeleteMeDialog({
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
						Bist du dir sicher dass du dein Profil mit dem Namen {user.name} löschen
						möchtest? Zum Bestätigen bitte den Namen des Accounts eingeben.
					</div>
					<div>
						<input
							className="textfield mt-5"
							type="text"
							placeholder={user.name}
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
							className={`btn-primary`}
							disabled={userTyped !== user.name}
							onClick={() => onClose(true)}
						>
							Löschen
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
										Lerntagebuch, sowie alle Lernfortschritte werden gelöscht.
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
										Dein Autorenprofil bleibt bestehen. Das beinhaltete deinen
										angezeigten Autorennamen und dein Profilbild.
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
										Alle erstellen Kurse und Lerneinheiten. Das beinhaltet die
										damit verbundenen Kompetenzen/Skills.
									</p>
								</div>
							</div>
						</div>

						<div className="h-10 border-l-2 border-gray-300"></div>

						<div className="relative flex w-full items-center">
							<div className="flex-1 rounded-lg border bg-slate-200 p-4 shadow">
								<span className="text-gray-700">
									<strong>Wichtig! </strong> <br />
									Solltest du als Autor tätig gewesen sein, bleiben deine
									erstellten Kurse und Lerneinheiten erhalten. Möchtest du diese
									löschen, klicke auf den Button "Autorenprofil löschen". Wenn du
									später dein Autorenprofil löschen möchtest, musst du dich an den
									Systemadministrator wenden.
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

function AuthorDeleteDialog({ onClose }: { onClose: () => void }) {
	return (
		<CenteredContainer>
			<Dialog
				style={{
					height: "30vh",
					width: "35vw",
					minHeight: "150px",
					minWidth: "300px"
				}}
				title={"Daten löschen"}
				onClose={onClose}
			>
				<CenteredContainer>
					<div className="flex flex-col items-center justify-center p-6 overflow-auto">
						<p className="mb-4 text-lg font-semibold">
							Es werden alle Daten inklusive der erstellen Kurse und Lerneinheiten
							gelöscht. Wenn nur deine Nutzerdaten löschen möchtest, klicke auf
							"Nutzerdaten löschen".{" "}
						</p>
						<p className="text-md "></p>
						<span className="text-red-300">
							Diese Funktion steht aktuell nicht zur Verfügung. Wenden sie sich an den
							Systemadministrator um ihre gesamten Daten zu löschen.
						</span>
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
