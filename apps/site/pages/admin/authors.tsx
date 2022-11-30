import { XIcon } from "@heroicons/react/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppRouter } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { Author, authorSchema } from "@self-learning/types";
import { Dialog, LoadingBox, OnDialogCloseFn } from "@self-learning/ui/common";
import { LabeledField, SearchField, Upload } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import { inferRouterOutputs } from "@trpc/server";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

export default function AuthorsPage() {
	useSession({ required: true });

	const [displayName, setDisplayName] = useState("");
	const { data: users, isLoading } = trpc.author.getAllWithSubject.useQuery();
	const [editTarget, setEditTarget] = useState<string | null>(null);
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const trpcContext = trpc.useContext();

	const filteredAuthors = useMemo(() => {
		if (!users) return [];
		if (!displayName || displayName.length === 0) return users;

		const lowerCaseDisplayName = displayName.toLowerCase().trim();
		return users.filter(user =>
			user.author?.displayName.toLowerCase().includes(lowerCaseDisplayName)
		);
	}, [displayName, users]);

	function onEdit(username: string) {
		setEditTarget(username);
		setOpenEditDialog(true);
	}

	function onEditDialogClose() {
		trpcContext.author.invalidate();
		setEditTarget(null);
		setOpenEditDialog(false);
	}

	return (
		<CenteredSection>
			<h1 className="mb-16 text-5xl">Autoren</h1>

			<SearchField
				placeholder="Suche nach Autor"
				onChange={e => setDisplayName(e.target.value)}
			/>

			{editTarget && <EditAuthorDialog onClose={onEditDialogClose} username={editTarget} />}

			{isLoading ? (
				<LoadingBox />
			) : (
				<div className="light-border rounded-lg border-x border-b bg-white">
					<table className="w-full table-auto">
						<thead className="rounded-lg border-b border-b-light-border bg-gray-100">
							<tr className="border-t">
								<th className="py-4 text-start text-sm font-semibold"></th>
								<th className="py-4 px-8 text-start text-sm font-semibold">Name</th>
								<th className="py-4 text-start text-sm font-semibold"></th>
							</tr>
						</thead>
						<tbody className="divide-y divide-light-border">
							{filteredAuthors.map(({ author, name }) => (
								<Fragment key={name}>
									{author && (
										<tr key={author.slug}>
											<td className="w-0 py-4 px-4 text-sm text-light">
												{author.imgUrl ? (
													// eslint-disable-next-line @next/next/no-img-element
													<img
														src={author.imgUrl ?? undefined}
														height={42}
														width={42}
														className="h-[42px] w-[42px] rounded-lg object-cover"
														alt={`Image of ${author.displayName}`}
													/>
												) : (
													<div className="h-[42px] w-[42px] rounded-lg bg-gray-200"></div>
												)}
											</td>
											<td className="py-4 px-8 text-sm font-medium">
												<div className="flex flex-wrap gap-4">
													<Link
														className="text-sm font-medium hover:text-secondary"
														href={`/authors/${author.slug}`}
													>
														{author.displayName}
													</Link>

													<span className="flex gap-2 text-xs">
														{author.subjectAdmin.map(({ subject }) => (
															<span
																key={subject.title}
																className="rounded-full bg-secondary px-3 py-[2px] text-white"
															>
																Admin: {subject.title}
															</span>
														))}
													</span>
												</div>
											</td>
											<td className="px-8">
												<div className="flex flex-wrap justify-end gap-4">
													<button
														className="btn-stroked"
														onClick={() => onEdit(name)}
													>
														Editieren
													</button>
												</div>
											</td>
										</tr>
									)}
								</Fragment>
							))}
						</tbody>
					</table>
				</div>
			)}
		</CenteredSection>
	);
}

function EditAuthorDialog({
	username,
	onClose
}: {
	username: string;
	onClose: OnDialogCloseFn<Author>;
}) {
	const { data: user, isLoading } = trpc.author.getAuthorForForm.useQuery({ username });

	return (
		<Dialog onClose={() => onClose(undefined)} title={username}>
			{isLoading ? (
				<LoadingBox />
			) : (
				<>
					{user && user.author && (
						<AuthorForm
							user={user}
							initialAuthor={{
								displayName: user.author.displayName,
								imgUrl: user.author.imgUrl,
								slug: user.author.slug,
								subjectAdmin: user.author.subjectAdmin.map(s => ({
									subjectId: s.subject.subjectId
								})),
								specializationAdmin: user.author.specializationAdmin.map(s => ({
									specializationId: s.specialization.specializationId
								}))
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
	user
}: {
	/** Initial data to populate the form.  */
	initialAuthor: Author;
	/** Information about the author. */
	user: inferRouterOutputs<AppRouter>["author"]["getAuthorForForm"];
}) {
	const methods = useForm({
		resolver: zodResolver(authorSchema),
		defaultValues: initialAuthor
	});

	function onSubmit(data: Author) {
		console.log(data);
	}

	const imgUrl = useWatch({ control: methods.control, name: "imgUrl" });
	const subjects = useWatch({ control: methods.control, name: "subjectAdmin" });

	return (
		<form
			className="grid gap-8 xl:grid-cols-[400px_600px]"
			onSubmit={methods.handleSubmit(onSubmit)}
		>
			<section className="flex flex-col gap-8 rounded-lg border border-light-border p-4">
				<LabeledField label="Name">
					<input
						className="textfield"
						type={"text"}
						{...methods.register("displayName")}
					/>
				</LabeledField>
				<LabeledField label="Slug">
					<input className="textfield" type={"text"} {...methods.register("slug")} />
				</LabeledField>
				<LabeledField label="Bild">
					<div className="flex w-full gap-4">
						<div className="flex w-full flex-col gap-2">
							<input
								className="textfield w-full"
								type={"text"}
								placeholder={"https://example.com/image.png"}
								{...methods.register("imgUrl")}
							/>
							<Upload
								mediaType="image"
								onUploadCompleted={url => methods.setValue("imgUrl", url)}
								preview={
									<>
										{imgUrl && imgUrl.length > 0 ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={imgUrl}
												alt={`Image of ${initialAuthor.displayName}`}
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
			</section>

			<section className="flex flex-col gap-8">
				<section className="flex flex-col gap-4 rounded-lg border border-light-border p-4">
					<h2 className="text-2xl">Fachbereich-Admin</h2>
					<div className="flex gap-4">
						{subjects.map(subject => (
							<span
								key={subject.subjectId}
								className="flex items-center gap-4 rounded-lg border border-light-border px-3 py-1 text-sm"
							>
								<span>{subject.subjectId}</span>
								<button className="p-1">
									<XIcon className="h-4 text-light" />
								</button>
							</span>
						))}
					</div>
				</section>
			</section>
		</form>
	);
}
