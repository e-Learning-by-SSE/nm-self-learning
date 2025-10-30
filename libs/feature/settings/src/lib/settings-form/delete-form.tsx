"use client";
import { trpc } from "@self-learning/api-client";
import {
	Dialog,
	DialogActions,
	ImageOrPlaceholder,
	showToast,
	Trans
} from "@self-learning/ui/common";
import { CenteredContainer, redirectToLogin, useRequiredSession } from "@self-learning/ui/layouts";
import {
	AuthorSvg,
	DiarySvg,
	IdeasFlowSvg,
	SoftwareEngineerSvg,
	StatisticSvg
} from "@self-learning/ui/static";
import { Session } from "next-auth";
import { useTranslation } from "next-i18next";
import { useState } from "react";

export function DeleteMeForm() {
	const { mutateAsync: deleteMe } = trpc.me.delete.useMutation();
	const session = useRequiredSession();
	const user = session.data?.user;
	const { t } = useTranslation("feature-settings");
	const [openStudentDeleteInfoDialog, setOpenStudentDeleteInfoDialog] = useState(false);
	const [openDeleteMeDialog, setOpenDeleteMeDialog] = useState(false);
	const [openDeleteAuthor, setDeleteAuthor] = useState(false);

	if (!user) return null;

	const acceptProfileDeletionInfo = (confirmed: boolean) => {
		setOpenStudentDeleteInfoDialog(false);
		if (confirmed) {
			setOpenDeleteMeDialog(true);
		}
	};

	return (
		<>
			<p className="mt-2 text-sm">
				<span role="img" aria-label="Warning">
					⚠️
				</span>{" "}
				{t("Be Careful! This changes cannot be undone.")}
			</p>

			<div className="mt-6 flex gap-4">
				<button
					onClick={() => setOpenStudentDeleteInfoDialog(true)}
					className="btn btn-danger w-full max-w-52"
				>
					{t("Delete-User-Data")}
				</button>

				<button
					onClick={() => {
						setDeleteAuthor(true);
					}}
					className="btn btn-danger w-full max-w-52"
				>
					{t("Delete-Author-Profile")}
				</button>
			</div>

			<div className="contents">
				{openStudentDeleteInfoDialog && (
					<StudentDeleteInfoDialog onClose={acceptProfileDeletionInfo} />
				)}

				{openDeleteMeDialog && (
					<DeleteMeDialog
						user={{ ...user }}
						onClose={async accepted => {
							setOpenDeleteMeDialog(false);
							if (accepted) {
								try {
									const success = await deleteMe();
									if (success) {
										showToast({
											type: "success",
											title: t("Account Deleted"),
											subtitle: t(
												"Your account data has been successfully deleted from the system."
											)
										});
									}
									redirectToLogin();
								} catch (error) {
									showToast({
										type: "error",
										title: t("The Account Could Not Be Deleted"),
										subtitle: t(
											"Please try again later or contact the system administrator."
										)
									});
								}
							}
						}}
					/>
				)}

				{openDeleteAuthor && (
					<AuthorDeleteDialog
						onClose={() => {
							setDeleteAuthor(false);
						}}
					/>
				)}
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
	const { t } = useTranslation("feature-settings");
	const { t: t_common } = useTranslation("common");

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
				title={t("Delete Student User Data")}
				onClose={() => {
					onClose(false);
				}}
			>
				<CenteredContainer>
					<div>
						{t(
							"Are you sure you want to delete your user data? Enter your name to confirm.",
							{ name: user.name }
						)}
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
							{t_common("Delete")}
						</button>
					</DialogActions>
				</div>
			</Dialog>
		</CenteredContainer>
	);
}

function StudentDeleteInfoDialog({ onClose }: { onClose: (confirm: boolean) => void }) {
	const session = useRequiredSession();
	const user = session.data?.user;
	const { t } = useTranslation("feature-settings");
	const { t: t_common } = useTranslation("common");

	return (
		<CenteredContainer>
			<Dialog
				style={{
					height: "80vh",
					width: "35vw",
					minHeight: "200px",
					minWidth: "300px"
				}}
				title={t("Delete User Data")}
				onClose={() => onClose(false)}
			>
				<CenteredContainer className="overflow-auto">
					<div className="flex min-h-screen flex-col items-center space-y-6 bg-gray-50 p-6">
						<h2 className="text-xl font-semibold text-gray-800">
							{t("What will be deleted?")}
						</h2>

						<div className="relative flex w-full items-center">
							<div className="flex w-full items-center">
								<div className="flex-1 rounded-lg border bg-white p-4 shadow">
									<p className="text-gray-700">
										<strong>
											{t(
												"After this action, no data can be traced back to your name."
											)}
										</strong>
									</p>
								</div>
							</div>
						</div>

						<div className="h-10 border-l-2 border-gray-300"></div>

						<div className="relative flex w-full items-center">
							<div className="flex w-full items-center">
								<div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-gray-200">
									{user?.avatarUrl && (
										<ImageOrPlaceholder
											src={user.avatarUrl}
											className="h-16 w-16 rounded-full object-cover"
										/>
									)}
									{!user?.avatarUrl && (
										<IdeasFlowSvg className="h-16 w-16 rounded-full" />
									)}
								</div>
								<div className="flex-1 rounded-lg border bg-white p-4 shadow">
									<p className="text-gray-600">
										{t("The following data will be deleted")}
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
										{t("The Learning Diary will be deleted")}
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
									<p className="text-gray-600">
										{t("Also all Learning Statistics")}
									</p>
								</div>
							</div>
						</div>

						<div className="h-10 border-l-2 border-gray-300"></div>

						<h2 className="text-xl font-semibold text-gray-800">
							{t("What will NOT be deleted?")}
						</h2>

						<div className="relative flex w-full items-center">
							<div className="flex w-full items-center">
								<div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-gray-200">
									<AuthorSvg className="h-16 w-16 rounded-full" />
								</div>
								<div className="flex-1 rounded-lg border bg-white p-4 shadow">
									<p className="text-gray-600">
										{t("Your Author Profile will remain")}
									</p>
								</div>
							</div>
						</div>

						<div className="h-10 border-l-2 border-gray-300"></div>

						<div className="relative flex w-full items-center">
							<div className="flex w-full items-center">
								<div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-gray-200">
									<SoftwareEngineerSvg className="h-16 w-16 rounded-full" />
								</div>
								<div className="flex-1 rounded-lg border bg-white p-4 shadow">
									<p className="text-gray-600">
										{t("All created Courses and Nano-Modules will remain.")}
									</p>
								</div>
							</div>
						</div>

						<div className="h-10 border-l-2 border-gray-300"></div>

						<div className="relative flex w-full items-center">
							<div className="flex-1 rounded-lg border bg-slate-200 p-4 shadow">
								<span className="text-gray-700">
									<strong>{t_common("Important")}!</strong> <br />
									{t(
										"Your author profile remains, press delete author profile if you want to delete this."
									)}
								</span>
							</div>
						</div>
					</div>
				</CenteredContainer>
				<div>
					<DialogActions onClose={() => onClose(false)}>
						<button className="btn-primary" onClick={() => onClose(true)}>
							{t_common("Continue")}
						</button>
					</DialogActions>
				</div>
			</Dialog>
		</CenteredContainer>
	);
}

function AuthorDeleteDialog({ onClose }: { onClose: () => void }) {
	const { t: t_common } = useTranslation("common");
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
						<Trans
							namespace="feature-settings"
							i18nKey="All data, including the created courses and learning units, will be deleted."
							components={{
								strong: <p className="mb-4 text-lg font-semibold " />,
								red: <p className="text-base text-red-300" />
							}}
						/>
					</div>
				</CenteredContainer>
				<div className="absolute bottom-5 right-5">
					<DialogActions onClose={onClose}>
						<button className="btn-primary" onClick={onClose}>
							{t_common("Continue")}
						</button>
					</DialogActions>
				</div>
			</Dialog>
		</CenteredContainer>
	);
}
