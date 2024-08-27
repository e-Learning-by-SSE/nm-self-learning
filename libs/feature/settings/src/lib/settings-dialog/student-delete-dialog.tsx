import { Dialog, DialogActions } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { User } from "next-auth";
import { useState } from "react";
import { PersonalDataTooltip } from "../settings-form/student-delete-form";
import { trpc } from "@self-learning/api-client";

export function StudentDeleteDialog({
	user,
	onClose
}: {
	user: User;
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

export function StudentDeleteInfoDialog({ onClose }: { onClose?: () => void }) {
	return (
		<CenteredContainer>
			<Dialog
				style={{
					height: "45vh",
					width: "35vw",
					overflow: "auto",
					minHeight: "200px",
					minWidth: "300px"
				}}
				title={"Delete Student"}
				onClose={() => {
					if (onClose) {
						onClose();
					}
				}}
			>
				<CenteredContainer>
					<div>
						<span>
							Folgende Daten werden gelöscht: <br /> <br />
							Account Informationen, Präferenzen und Einstellungen, sowie sämtliche
							Daten die eng mit dem Account verknüpft sind.
							<br />
							<br />
						</span>
						<div className="rounded-lg border bg-slate-200 p-2">
							<span>
								<strong>Wichtig! </strong> <br /> Erstelle Kurse und Lerneinheiten
								bleiben erhalten. Möchtest du diese löschen, klicke auf den Button
								"Alle Daten löschen".
							</span>
						</div>
					</div>
				</CenteredContainer>
				<div className="mt-auto">
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

export function StudentAllDeleteInfoDialog({ onClose }: { onClose?: () => void }) {
	const { isLoading, data: coursesAndLessons } = trpc.me.getAllCreatedCourseAndLessons.useQuery();
	return (
		<CenteredContainer>
			<Dialog
				style={{
					height: "60vh",
					width: "35vw",
					overflow: "auto",
					minHeight: "200px",
					minWidth: "300px"
				}}
				title={"Delete Student"}
				onClose={() => {
					if (onClose) {
						onClose();
					}
				}}
			>
				<CenteredContainer>
					<div>
						<div className="flex items-center">
							<span>Folgende Daten werden gelöscht: Persönliche Daten</span>
							<PersonalDataTooltip />
						</div>
						Außerdem alle erstellten Kurse und Lerneinheiten:
						{!isLoading && coursesAndLessons && (
							<div className="mt-5">
								<h2>Kurse</h2>
								{coursesAndLessons.courses.length > 0 ? null : "Kein Kurs erstellt"}
								<ul className="p-1 ml-5 mt-2 h-20 list-disc overflow-x-auto rounded-lg bg-slate-200">
									{coursesAndLessons.courses.map(course => (
										<li key={course.courseId}>{course.title}</li>
									))}
								</ul>
								<div className="mt-5" />
								<h2>Lerneinheiten</h2>
								{coursesAndLessons.lessons.lessons.length > 0
									? null
									: "Keine Lerneinheit erstellt"}
								<ul className="p-1 ml-5 mt-2 h-20 list-disc overflow-x-auto rounded-lg bg-gray-50">
									{coursesAndLessons.lessons.lessons.map(lesson => (
										<li key={lesson.lessonId}>{lesson.title}</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</CenteredContainer>
				<div className="mt-auto">
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
