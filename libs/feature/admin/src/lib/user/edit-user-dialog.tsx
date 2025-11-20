"use client";
import { TrashIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, UserRole } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import { userSchema } from "@self-learning/types";
import {
	Dialog,
	DialogActions,
	LoadingBox,
	OnDialogCloseFn,
	showToast
} from "@self-learning/ui/common";
import { LabeledField, Upload } from "@self-learning/ui/forms";
import { OpenAsJsonButton } from "@self-learning/ui/forms";
import { useState } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";

export function EditUserDialog({
	username,
	onClose
}: {
	username: string;
	onClose: OnDialogCloseFn<User>;
}) {
	const { data: user, isLoading } = trpc.admin.getUser.useQuery(username);

	return (
		<Dialog onClose={() => onClose(undefined)} title={user?.displayName ?? username}>
			{isLoading ? (
				<LoadingBox />
			) : (
				<>
					{user && (
						<UserForm
							initialUser={{
								...user,
								emailVerified: new Date(user.emailVerified ?? "")
							}}
							username={username}
							onClose={onClose}
						/>
					)}
				</>
			)}
		</Dialog>
	);
}

function UserForm({
	initialUser,
	username,
	onClose
}: {
	initialUser: User;
	username: string;
	onClose: OnDialogCloseFn<User>;
}) {
	const { mutateAsync: updateUser } = trpc.admin.updateUser.useMutation();
	const form = useForm({
		resolver: zodResolver(userSchema),
		defaultValues: initialUser
	});

	function onSubmit(user: User) {
		updateUser({ username, user })
			.then(res => {
				showToast({
					type: "success",
					title: "User gespeichert!",
					subtitle: res.displayName
				});
				onClose(undefined);
			})
			.catch(err => {
				console.error(err);
				showToast({
					type: "error",
					title: "Fehler",
					subtitle: "User konnte nicht gespeichert werden."
				});
			});
	}

	return (
		<FormProvider {...form}>
			<form
				className="flex flex-col justify-between overflow-hidden"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<div className="absolute top-8 right-8">
					<OpenAsJsonButton form={form} validationSchema={userSchema} />
				</div>

				<div className="grid gap-4 overflow-y-auto pb-12 xl:grid-cols-[1fr_300px] xl:overflow-y-hidden">
					<div className="rounded-lg border border-c-border p-6 xl:row-span-3">
						<UserData />
					</div>
					<div className=" rounded-lg border border-c-danger-muted bg-c-danger-subtle p-6">
						<h2 className="text-lg font-bold text-c-danger-strong">
							{" "}
							<span role="img" aria-label="Warning">
								⚠️
							</span>{" "}
							Danger Zone
						</h2>
						<div className="mt-8">
							<ActionButtons username={username} />
						</div>
					</div>
				</div>

				<div className="absolute bottom-8 right-8 flex justify-end">
					<DialogActions onClose={onClose}>
						<button className="btn-primary" type="submit">
							Speichern
						</button>
					</DialogActions>
				</div>
			</form>
		</FormProvider>
	);
}

function UserData() {
	const { register, control, setValue, formState, watch } = useFormContext<User>();
	const imgUrl = useWatch({ control, name: "image" });
	const errors = formState.errors;
	const height = window.innerHeight * 0.6;

	const isValidDate = (date: Date | null | undefined) => {
		if (!date) return false;
		if (date === null) return false;
		return date instanceof Date && !isNaN(date.getTime());
	};

	return (
		<div
			className="overflow-x-hidden overflow-y-hidden p-2 xl:overflow-y-auto"
			style={{ maxHeight: height }}
		>
			<h2 className="mb-4 text-2xl">Daten</h2>
			<div className="flex flex-col gap-4">
				<LabeledField label="Name" error={errors.displayName?.message}>
					<input className="textfield" type={"text"} {...register("name")} />
				</LabeledField>
				<LabeledField label="Anzeigename" error={errors.displayName?.message}>
					<input className="textfield" type={"text"} {...register("displayName")} />
				</LabeledField>
				<LabeledField label="Email" error={errors.email?.message}>
					<input className="textfield" type={"text"} {...register("email")} />
				</LabeledField>
				<LabeledField label="Role" error={errors.role?.message}>
					<select
						title="Role"
						value={watch("role")}
						onChange={v => {
							setValue("role", v.target.value as UserRole);
						}}
						className="textfield w-64 rounded-lg px-8"
					>
						{Object.values(UserRole).map(role => (
							<option key={"option:" + role} value={role}>
								{role}
							</option>
						))}
					</select>
				</LabeledField>
				<LabeledField label="Email Verified Date" error={errors.emailVerified?.message}>
					<input
						className="textfield"
						type={"date"}
						value={
							isValidDate(watch("emailVerified"))
								? watch("emailVerified")?.toISOString().slice(0, 10)
								: ""
						}
						onChange={v => {
							setValue("emailVerified", new Date(v.target.value));
						}}
					/>
				</LabeledField>
				<LabeledField label="Bild" error={errors.image?.message}>
					<div className="flex w-full gap-4">
						<div className="flex w-full flex-col gap-2">
							<input
								className="textfield w-full"
								type={"text"}
								placeholder={"https://example.com/image.png"}
								{...register("image", { required: false })}
							/>
							<Upload
								mediaType="image"
								onUploadCompleted={url => setValue("image", url)}
								preview={
									<>
										{imgUrl && imgUrl.length > 0 ? (
											<img
												src={imgUrl}
												alt="Avatar"
												className="mx-auto h-32 w-32 shrink-0 rounded-lg object-cover"
											></img>
										) : (
											<div className="mx-auto h-32 w-32  shrink-0 rounded-lg bg-c-surface-2"></div>
										)}
									</>
								}
							/>
						</div>
					</div>
				</LabeledField>
			</div>
		</div>
	);
}

function ActionButtons({ username }: { username: string }) {
	const { mutateAsync: deleteUserAndDependentData } =
		trpc.admin.deleteUserAndDependentData.useMutation();
	const { mutateAsync: deleteUser } = trpc.admin.deleteUser.useMutation();
	const [deleteData, setDeleteData] = useState(false);

	const onDeleteAllData = () => {
		if (confirm("Wirklich alle Daten löschen?")) {
			setDeleteData(true);
			deleteUserAndDependentData(username)
				.then(result => {
					showToast({
						type: "success",
						title: "Daten gelöscht!",
						subtitle: "Alle Daten wurden gelöscht."
					});
					console.log(result);
				})
				.catch(err => {
					console.error(err);
					showToast({
						type: "error",
						title: "Fehler",
						subtitle: "Daten konnten nicht gelöscht werden."
					});
				})
				.finally(() => {
					setDeleteData(false);
				});
		}
	};

	const onDeleteUser = () => {
		if (confirm("Soll der Nutzer wirklich gelöscht werden?")) {
			setDeleteData(true);
			deleteUser(username)
				.then(_ => {
					showToast({
						type: "success",
						title: "Daten gelöscht!",
						subtitle: "Nutzer wurde erfolgreich gelöscht."
					});
				})
				.catch(err => {
					console.error(err);
					showToast({
						type: "error",
						title: "Fehler",
						subtitle: "Daten konnten nicht gelöscht werden."
					});
				})
				.finally(() => {
					setDeleteData(false);
				});
		}
	};

	return (
		<div className="">
			<button
				type="button"
				className="flex min-w-full justify-start gap-2 rounded-lg bg-c-danger px-8 py-2 text-sm font-semibold text-white transition-colors hover:bg-c-danger-strong disabled:bg-opacity-25"
				onClick={onDeleteUser}
			>
				{deleteData ? (
					<>
						<div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
						<span className="ml-2">Deleting...</span>
					</>
				) : (
					<>
						<TrashIcon className="h-5 w-5" />
						<span className="ml-2">Nutzerdaten löschen</span>
					</>
				)}
			</button>
			<button
				type="button"
				className="mt-4 flex min-w-full justify-start gap-2 rounded-lg bg-c-danger px-8 py-2 text-sm font-semibold text-white transition-colors hover:bg-c-danger-strong disabled:bg-opacity-25"
				onClick={onDeleteAllData}
			>
				{deleteData ? (
					<>
						<div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
						<span className="ml-2">Deleting...</span>
					</>
				) : (
					<>
						<TrashIcon className="h-5 w-5" />
						<span className="ml-2">Alle Daten löschen</span>
					</>
				)}
			</button>
		</div>
	);
}
