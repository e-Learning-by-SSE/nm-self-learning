import { PlusIcon, UserGroupIcon } from "@heroicons/react/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppRouter } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { Subject, subjectSchema } from "@self-learning/types";
import {
	AuthorChip,
	Dialog,
	DialogActions,
	ImageOrPlaceholder,
	OnDialogCloseFn,
	SectionHeader,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import {
	FieldHint,
	Form,
	InputWithButton,
	LabeledField,
	Upload,
	useSlugify
} from "@self-learning/ui/forms";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import { inferRouterOutputs } from "@trpc/server";
import { OpenAsJsonButton } from "libs/feature/teaching/src/lib/json-editor-dialog";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { AddAuthorDialog, AuthorFromGetAllQuery } from "../author/add-author-dialog";

type SpecializationsFromQuery =
	inferRouterOutputs<AppRouter>["subject"]["getForEdit"]["specializations"];

export function SubjectEditor({
	initialSubject,
	onSubmit,
	specializations
}: {
	initialSubject: Subject;
	onSubmit: (s: Subject) => unknown;
	specializations: SpecializationsFromQuery;
}) {
	const form = useForm<Subject>({
		resolver: zodResolver(subjectSchema),
		defaultValues: initialSubject
	});

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");
	const cardImgUrl = form.watch("cardImgUrl");
	const imgUrlBanner = form.watch("imgUrlBanner");

	const {
		register,
		formState: { errors }
	} = form;

	const [openPermissionDialog, setOpenPermissionDialog] = useState(false);

	return (
		<FormProvider {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<SidebarEditorLayout
					sidebar={
						<>
							<div>
								<span className="font-semibold text-secondary">
									Fachgebiet{" "}
									{initialSubject.subjectId === "" ? "erstellen" : "speichern"}
								</span>

								<h1 className="text-2xl">
									{initialSubject.subjectId === ""
										? "Neues Fachgebiet"
										: initialSubject.title}
								</h1>
							</div>

							<OpenAsJsonButton form={form} validationSchema={subjectSchema} />

							<button className="btn-primary w-full" type="submit">
								{initialSubject.subjectId === "" ? "Erstellen" : "Speichern"}
							</button>

							<Form.SidebarSection>
								<Form.SidebarSectionTitle
									title="Informationen"
									subtitle="Informationen über dieses Fachgebiet."
								></Form.SidebarSectionTitle>
								<div className="flex flex-col gap-4">
									<LabeledField label="Titel" error={errors.title?.message}>
										<input
											className="textfield"
											type={"text"}
											{...form.register("title")}
											onBlur={slugifyIfEmpty}
										/>
									</LabeledField>

									<LabeledField label="Slug" error={errors.slug?.message}>
										<InputWithButton
											input={
												<input
													className="textfield"
													type={"text"}
													{...form.register("slug")}
												/>
											}
											button={
												<button
													type="button"
													className="btn-stroked"
													onClick={slugifyField}
												>
													Generieren
												</button>
											}
										/>
										<FieldHint>
											Der <strong>slug</strong> wird in der URL angezeigt.
											Muss einzigartig sein.
										</FieldHint>
									</LabeledField>

									<LabeledField
										label="Untertitel"
										error={errors.subtitle?.message}
									>
										<textarea
											className="textfield"
											{...register("subtitle")}
											rows={16}
										/>
										<FieldHint>
											Beschreibung dieses Fachgebiets in 2-3 Sätzen.
										</FieldHint>
									</LabeledField>
								</div>
							</Form.SidebarSection>
						</>
					}
				>
					<section>
						<SectionHeader
							title="Bild (Banner)"
							subtitle="Bild, das als Banner am Seitenbeginn angezeigt wird."
						/>

						<Upload
							mediaType="image"
							onUploadCompleted={url => form.setValue("imgUrlBanner", url)}
							preview={
								<ImageOrPlaceholder
									src={imgUrlBanner ?? undefined}
									className="h-64 rounded-lg object-cover"
								/>
							}
						/>
					</section>

					<section className="w-fit">
						<SectionHeader
							title="Bild (Karte)"
							subtitle="Bild das auf Karten angezeigt wird."
						/>

						<Upload
							mediaType="image"
							onUploadCompleted={url => form.setValue("cardImgUrl", url)}
							preview={
								<ImageOrPlaceholder
									src={cardImgUrl ?? undefined}
									className="h-64 rounded-lg object-cover"
								/>
							}
						/>
					</section>

					<section>
						<SectionHeader
							title="Spezialisierungen"
							subtitle="Spezialisierungen dieses Fachgebiets."
						/>

						{initialSubject.subjectId === "" ? (
							<p className="text-sm text-light">
								Spezialisierungen können erst hinzugefügt werden, nachdem das
								Fachgebiet erstellt wurde.
							</p>
						) : (
							<>
								<div className="mb-8 flex flex-wrap gap-4">
									<a
										rel="noopener noreferrer"
										target="_blank"
										className="btn-primary w-fit"
										href={`/teaching/subjects/${initialSubject.subjectId}/specializations/create`}
									>
										<PlusIcon className="icon h-5" />
										<span>Hinzufügen</span>
									</a>

									<button
										className="btn-stroked h-fit"
										type="button"
										onClick={() => setOpenPermissionDialog(true)}
									>
										<UserGroupIcon className="icon h-5" />
										<span>Autoren verwalten</span>
									</button>

									{openPermissionDialog && (
										<SpecializationPermissionsDialog
											subjectId={initialSubject.subjectId}
											specializations={specializations}
											onClose={() => setOpenPermissionDialog(false)}
										/>
									)}
								</div>

								<ul className="flex flex-col gap-4">
									{specializations.map(spec => (
										<li
											key={spec.specializationId}
											className="flex rounded-lg border border-light-border bg-white"
										>
											<ImageOrPlaceholder
												src={spec.cardImgUrl ?? undefined}
												className="w-32 rounded-l-lg object-cover"
											/>
											<div className="flex w-full flex-col justify-between gap-4 p-4">
												<div className="flex flex-col gap-2">
													<span className="text-lg font-semibold">
														{spec.title}
													</span>
													<p className="text-sm text-light">
														{spec.subtitle}
													</p>
												</div>

												<ul className="flex flex-wrap gap-4">
													{spec.specializationAdmin.map(admin => (
														<AuthorChip
															imgUrl={admin.author.imgUrl}
															displayName={admin.author.displayName}
															key={admin.author.username}
															slug={admin.author.slug}
														/>
													))}
												</ul>
												<a
													className="btn-stroked w-fit"
													rel="noopener noreferrer"
													target="_blank"
													href={`/teaching/subjects/${initialSubject.subjectId}/specializations/edit/${spec.specializationId}`}
												>
													Editieren
												</a>
											</div>
										</li>
									))}
								</ul>
							</>
						)}
					</section>
				</SidebarEditorLayout>
			</form>
		</FormProvider>
	);
}

type AuthorSpecializationMap = {
	[specializationId: string]: {
		[username: string]: boolean;
	};
};

function SpecializationPermissionsDialog({
	subjectId,
	onClose,
	specializations
}: {
	subjectId: string;
	specializations: SpecializationsFromQuery;
	onClose: () => void;
}) {
	const [authors, setAuthors] = useState(() => {
		const initialAuthors = specializations
			.flatMap(a => a.specializationAdmin)
			.map(a => a.author);

		const map = new Map<
			string,
			SpecializationsFromQuery[0]["specializationAdmin"][0]["author"]
		>();

		for (const author of initialAuthors) {
			map.set(author.username, author);
		}

		return Array.from(map.values());
	});

	const [specMap, setSpecMap] = useState<AuthorSpecializationMap>(() => {
		const _specMapp: AuthorSpecializationMap = {};

		for (const spec of specializations) {
			const usernames: Record<string, boolean> = {};
			for (const admin of spec.specializationAdmin) {
				usernames[admin.author.username] = true;
			}
			_specMapp[spec.specializationId] = usernames;
		}

		return _specMapp;
	});

	const [openAddAuthorDialog, setOpenAddAuthorDialog] = useState(false);

	const { mutateAsync: updateSpecAdmins } =
		trpc.subject.setSpecializationPermissions.useMutation();

	const onAddAuthorDialogClosed: OnDialogCloseFn<AuthorFromGetAllQuery> = author => {
		setOpenAddAuthorDialog(false);
		if (!author) return;

		if (authors.some(a => a.username === author.username)) {
			showToast({
				type: "warning",
				title: "Bereits vorhanden",
				subtitle: author.displayName
			});
			return;
		}

		setAuthors(prev => {
			return [author, ...prev];
		});
	};

	function onChecked(specId: string, username: string, checked: boolean) {
		setSpecMap(prev => ({
			...prev,
			[specId]: {
				...prev[specId],
				[username]: checked
			}
		}));
	}

	async function onSave() {
		try {
			await updateSpecAdmins({ subjectId, specMap });
			showToast({ type: "success", title: "Berechtigte Autoren aktualisiert", subtitle: "" });
			onClose();
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: "Fehler", subtitle: error.message });
			}
		}
	}

	return (
		<Dialog
			onClose={onClose}
			title="Berechtigte Autoren"
			style={{ maxWidth: "80vw", maxHeight: "80vh" }}
		>
			<div className="flex flex-col gap-4 divide-x divide-light-border overflow-auto">
				<div className="text-sm text-light">
					<p>
						In diesem Dialog können Autoren <strong>Spezialisierungen</strong>{" "}
						zugeordnet werden. Nur Autoren, die einer Spezialisierung zugeordnet sind,
						können diese bearbeiten.
					</p>
					<p>
						Admins und Fachbereich-Admins können ebenfalls Spezialisierungen bearbeiten
					</p>
					<p>
						In der folgenden Tabelle sind alle Autoren aufgelistet, die mindestens einer
						Spezialisierung zugeordnet sind. Weitere Autoren können durch den{" "}
						<strong>Autor hinzufügen</strong>-Button hinzugefügt werden.
					</p>
				</div>

				<button
					type="button"
					className="btn-primary w-fit"
					onClick={() => setOpenAddAuthorDialog(true)}
				>
					<PlusIcon className="icon h-5" />
					<span>Autor hinzufügen</span>
				</button>

				{openAddAuthorDialog && (
					<AddAuthorDialog open={openAddAuthorDialog} onClose={onAddAuthorDialogClosed} />
				)}

				<Table
					head={
						<>
							<TableHeaderColumn>Autor</TableHeaderColumn>
							{specializations.map(spec => (
								<TableHeaderColumn key={spec.specializationId}>
									{spec.title}
								</TableHeaderColumn>
							))}
						</>
					}
				>
					{authors.map(author => (
						<tr key={author.username}>
							<TableDataColumn>
								<span className="flex items-center gap-4">
									<ImageOrPlaceholder
										src={author.imgUrl ?? undefined}
										className="h-10 w-10 shrink-0 rounded-lg object-cover"
									/>
									<a
										target="_blank"
										rel="noreferrer"
										href={`/authors/${author.slug}`}
										className="whitespace-nowrap hover:text-secondary"
									>
										{author.displayName}
									</a>
								</span>
							</TableDataColumn>
							{specializations.map(spec => (
								<TableDataColumn key={spec.specializationId}>
									<span className="flex justify-center">
										<input
											type={"checkbox"}
											className="checkbox"
											checked={
												specMap[spec.specializationId][author.username] ===
												true
											}
											onChange={e => {
												onChecked(
													spec.specializationId,
													author.username,
													e.target.checked
												);
											}}
										/>
									</span>
								</TableDataColumn>
							))}
						</tr>
					))}
				</Table>
			</div>

			<DialogActions onClose={onClose}>
				<button type="button" className="btn-primary" onClick={onSave}>
					Speichern
				</button>
			</DialogActions>
		</Dialog>
	);
}
