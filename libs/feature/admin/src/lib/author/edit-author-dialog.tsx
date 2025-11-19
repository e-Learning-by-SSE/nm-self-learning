import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import { Author, authorSchema } from "@self-learning/types";
import {
	Dialog,
	DialogActions,
	LoadingBox,
	OnDialogCloseFn,
	showToast
} from "@self-learning/ui/common";
import { LabeledField, Upload } from "@self-learning/ui/forms";
import { OpenAsJsonButton } from "@self-learning/ui/forms";
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
								memberships: [] // TODO user.memberships
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
	const imgUrl = useWatch({ control: control, name: "imgUrl" });
	const errors = formState.errors;

	return (
		<section className="flex flex-col rounded-lg border border-light-border p-4">
			<h2 className="mb-4 text-2xl">Daten</h2>
			<div className="flex flex-col gap-4">
				<LabeledField label="Name" error={errors.displayName?.message}>
					<input className="textfield" type={"text"} {...register("displayName")} />
				</LabeledField>
				<LabeledField label="Slug" error={errors.slug?.message}>
					<input className="textfield" type={"text"} {...register("slug")} />
				</LabeledField>
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
