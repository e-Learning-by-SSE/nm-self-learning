import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import { GroupPicker } from "@self-learning/teaching";
import { Author, authorSchema, GroupEntry } from "@self-learning/types";
import {
	Dialog,
	DialogActions,
	LoadingBox,
	OnDialogCloseFn,
	showToast
} from "@self-learning/ui/common";
import { LabeledField, Upload } from "@self-learning/ui/forms";
import { OpenAsJsonButton } from "@self-learning/ui/forms";
import { useMemo } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";

export function EditAuthorDialog({
	username,
	onClose
}: {
	username: string;
	onClose: OnDialogCloseFn<Author>;
}) {
	const { data: user, isLoading } = trpc.author.getAuthorForForm.useQuery({ username });

	return (
		<Dialog onClose={() => onClose(undefined)} title={user?.author?.displayName ?? username}>
			{isLoading ? (
				<LoadingBox />
			) : (
				<>
					{user && user.author && (
						<AuthorForm
							username={username}
							onClose={onClose}
							initialAuthor={{
								displayName: user.author.displayName,
								imgUrl: user.author.imgUrl,
								slug: user.author.slug,
								memberships: user.memberships,
								defaultGroupId: user.defaultGroupId
							}}
						/>
					)}
				</>
			)}
		</Dialog>
	);
}

function AuthorForm({
	initialAuthor,
	username,
	// user,
	onClose
}: {
	/** Initial data to populate the form.  */
	initialAuthor: Author;
	username: string;
	onClose: OnDialogCloseFn<Author>;
}) {
	const { mutateAsync: updateAuthor } = trpc.author.updateAsAdmin.useMutation();
	const form = useForm({ resolver: zodResolver(authorSchema), defaultValues: initialAuthor });
	function onSubmit(author: Author) {
		console.log("Saving author...", author);

		updateAuthor({ author, username })
			.then(res => {
				showToast({
					type: "success",
					title: "Autor gespeichert!",
					subtitle: res.displayName
				});
				onClose(undefined);
			})
			.catch(err => {
				console.error(err);
				showToast({
					type: "error",
					title: "Fehler",
					subtitle: "Autor konnte nicht gespeichert werden."
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
					<OpenAsJsonButton form={form} validationSchema={authorSchema} />
				</div>

				<div className="grid gap-8 overflow-y-auto xl:grid-cols-[400px_600px] xl:overflow-y-auto">
					<AuthorData />
					{/* <AuthorMemberships /> */}
					{/* TODO turn into a form */}
				</div>

				<div className="absolute bottom-10 right-10 xl:right-14">
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

function AuthorData() {
	const { register, control, setValue, formState } = useFormContext<Author>();
	const imgUrl = useWatch({ control, name: "imgUrl" });
	const memberships = useWatch({ control, name: "memberships" });
	const defaultGroupId = useWatch({ control, name: "defaultGroupId" });
	const errors = formState.errors;

	const defaultGroup = useMemo(() => {
		return (
			memberships?.find(membership => membership.group.id === defaultGroupId)?.group ?? null
		);
	}, [memberships, defaultGroupId]);

	function onDefaultGroupSelected(selectedGroup: GroupEntry | null | undefined) {
		// avoid form cancellation as null option
		if (selectedGroup === undefined) return;
		if (
			selectedGroup &&
			memberships.find(membership => membership.group.id === selectedGroup.id) === undefined
		) {
			showToast({
				type: "error",
				title: "Ungültige Gruppe",
				subtitle: "Die ausgewählte Gruppe muss eine der Gruppen des Autors sein."
			});
			return;
		}
		//
		setValue("defaultGroupId", selectedGroup?.id ?? null);
	}

	return (
		<section className="flex flex-col rounded-lg border border-c-border p-4">
			<h2 className="mb-4 text-2xl">Daten</h2>
			<div className="flex flex-col gap-4">
				<LabeledField label="Name" error={errors.displayName?.message}>
					<input className="textfield" type={"text"} {...register("displayName")} />
				</LabeledField>
				<LabeledField label="Slug" error={errors.slug?.message}>
					<input className="textfield" type={"text"} {...register("slug")} />
				</LabeledField>
				<GroupPicker
					header="Standardgruppe"
					description="Wenn ausgewählt, werden standardmäßig neuen Kurse und Lektionen des Autors dieser Gruppe zugewiesen."
					value={defaultGroup}
					onChange={onDefaultGroupSelected}
					isAdmin={true}
				/>
				<LabeledField label="Bild" error={errors.imgUrl?.message}>
					<div className="flex w-full gap-4">
						<div className="flex w-full flex-col gap-2">
							<input
								className="textfield w-full"
								type={"text"}
								placeholder={"https://example.com/image.png"}
								{...register("imgUrl")}
							/>
							<Upload
								mediaType="image"
								onUploadCompleted={url => setValue("imgUrl", url)}
								preview={
									<>
										{imgUrl && imgUrl.length > 0 ? (
											<img
												src={imgUrl}
												alt="Avatar"
												className="mx-auto h-32 w-32 shrink-0 rounded-lg object-cover"
											></img>
										) : (
											<div className="mx-auto h-32 w-32  shrink-0 rounded-lg bg-c-surface-3"></div>
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
