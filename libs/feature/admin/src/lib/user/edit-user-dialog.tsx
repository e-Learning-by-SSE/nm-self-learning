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
import { set } from "date-fns";
import { OpenAsJsonButton } from "libs/feature/teaching/src/lib/json-editor-dialog";
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
				<LoadingBox /> /* TODO: better loading box from marcel */
			) : (
				<>
					{user && (
						<UserForm
							initialUser={{
                                id: user.id,
								name: user.name,
								displayName: user.displayName,
								email: user.email,
								role: user.role,
                                emailVerified: new Date(user.emailVerified ?? ""),
								image: user.image
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

				<div className="gap-8 overflow-y-auto">
					<UserData />
				</div>

				<DialogActions onClose={onClose}>
					<button className="btn-primary" type="submit">
						Speichern
					</button>
				</DialogActions>
			</form>
		</FormProvider>
	);
}

function UserData() {
	const { register, control, setValue, formState, watch } = useFormContext<User>();
	const imgUrl = useWatch({ control, name: "image" });
	const errors = formState.errors;

	return (
		<section className="flex flex-col rounded-lg border border-light-border p-4">
			<h2 className="mb-4 text-2xl">Daten</h2>
			<div className="flex flex-col gap-4">
				<LabeledField label="Name" error={errors.displayName?.message}>
					<input className="textfield" type={"text"} {...register("name")} />
				</LabeledField>
				<LabeledField label="Displayname" error={errors.displayName?.message}>
					<input className="textfield" type={"text"} {...register("displayName")} />
				</LabeledField>
				<LabeledField label="Email" error={errors.email?.message}>
					<input className="textfield" type={"text"} {...register("email")} />
				</LabeledField>
				<LabeledField label="Role" error={errors.role?.message}>
				<select
							value={watch("role")}
							onChange={v => {setValue("role", v.target.value as UserRole) /*TODO Ask Marcel about this*/}}
							className="textfield w-64 rounded-lg px-8"
						>
							{Object.values(UserRole).map(role => (
								<option value={role}>{role}</option>
							))}
						</select>
				</LabeledField>
				<LabeledField label="Email Verified" error={errors.emailVerified?.message}>
					<input className="textfield" type={"text"} {...register("emailVerified")} />
				</LabeledField>
				<LabeledField label="Bild" error={errors.image?.message}>
					<div className="flex w-full gap-4">
						<div className="flex w-full flex-col gap-2">
							<input
								className="textfield w-full"
								type={"text"}
								placeholder={"https://example.com/image.png"}
								{...register("image")}
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
											<div className="mx-auto h-32 w-32  shrink-0 rounded-lg bg-gray-200"></div>
										)}
									</>
								}
							/>
						</div>
					</div>
				</LabeledField>
			</div>
		</section>
	);
}
