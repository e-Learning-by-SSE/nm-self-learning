import { zodResolver } from "@hookform/resolvers/zod";
import { createEmptyLesson, lessonSchema } from "@self-learning/types";
import { Dialog, DialogActions, OnDialogCloseFn, Tab, Tabs } from "@self-learning/ui/common";
import { LabeledField, MarkdownEditorDialog } from "@self-learning/ui/forms";
import { SidebarSectionTitle } from "libs/ui/forms/src/lib/form-container";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import slugify from "slugify";
import { AuthorsForm } from "../../../author/authors-form";
import { OpenAsJsonButton } from "../../../json-editor-dialog";
import { LessonContentEditor } from "../../../lesson/forms/lesson-content";
import { QuizEditor } from "../../../lesson/forms/quiz-editor";
import { LessonFormModel } from "../../../lesson/lesson-form-model";

export function EditLessonDialog({
	onClose,
	initialLesson
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	const session = useSession();

	const [selectedTab, setSelectedTab] = useState(0);
	const isNew = !initialLesson;

	const methods = useForm<LessonFormModel>({
		context: undefined,
		defaultValues: initialLesson ?? {
			...createEmptyLesson(),
			// Add current user as author
			authors: session.data?.user.author ? [{ slug: session.data.user.author.slug }] : []
		},
		resolver: zodResolver(lessonSchema)
	});

	return (
		<Dialog
			title={isNew ? "Neue Lernheit erstellen" : "Lerneinheit anpassen"}
			onClose={() => window.confirm("Änderungen verwerfen?") && onClose(undefined)}
			style={{ height: "80vh", width: "80vw" }}
		>
			<div className="absolute right-8 top-8 flex gap-4">
				<OpenAsJsonButton validationSchema={lessonSchema} />
				{initialLesson?.lessonId && (
					<a
						className="btn-stroked"
						target="_blank"
						rel="noreferrer"
						href={`/teaching/lessons/edit/${initialLesson?.lessonId}`}
						title="Formular in einem neuen Tab öffnen. Änderungen werden nicht übernommen."
					>
						Im separaten Editor öffnen
					</a>
				)}
			</div>
			<FormProvider {...methods}>
				<form
					id="lessonform"
					onSubmit={methods.handleSubmit(onClose, console.log)}
					className="flex h-full flex-col overflow-hidden"
				>
					<div className="flex h-full flex-col gap-4 overflow-hidden">
						<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
							<Tab>Übersicht</Tab>
							<Tab>Lernkontrolle</Tab>
						</Tabs>

						<div className="playlist-scroll flex h-full flex-col gap-4 overflow-auto">
							{selectedTab === 0 && (
								<div className="grid h-full gap-8 xl:grid-cols-[500px_1fr]">
									<Overview />
									<LessonContentEditor />
								</div>
							)}
							{selectedTab === 1 && <QuizEditor />}
						</div>
					</div>

					<DialogActions onClose={onClose}>
						<button type="submit" className="btn-primary">
							Speichern
						</button>
					</DialogActions>
				</form>
			</FormProvider>
		</Dialog>
	);
}

function Overview() {
	const {
		control,
		register,
		getValues,
		setValue,
		formState: { errors }
	} = useFormContext<LessonFormModel>();

	function slugifyTitle() {
		const title = getValues("title");
		const slug = slugify(title, { lower: true });
		setValue("slug", slug);
	}

	const [openDescriptionEditor, setOpenDescriptionEditor] = useState(false);

	return (
		<div className="flex flex-col gap-8">
			<div className="flex h-full w-full flex-col gap-4 rounded-lg border border-light-border p-4">
				<SidebarSectionTitle
					title="Grunddaten"
					subtitle="Grunddaten dieser Lerneinheit."
				></SidebarSectionTitle>

				<LabeledField label="Titel" error={errors.title?.message}>
					<input
						{...register("title")}
						placeholder="Die Neue Lerneinheit"
						onBlur={() => {
							if (getValues("slug") === "") {
								slugifyTitle();
							}
						}}
						autoComplete="off"
					/>
				</LabeledField>

				<div className="grid items-start gap-2 sm:flex">
					<LabeledField label="Slug" error={errors.slug?.message}>
						<input
							{...register("slug")}
							placeholder='Wird in der URL angezeigt, z. B.: "die-neue-lerneinheit"'
							autoComplete="off"
						/>
					</LabeledField>

					<button
						type="button"
						className="btn-stroked h-fit self-end text-sm"
						onClick={slugifyTitle}
					>
						Generieren
					</button>
				</div>

				<LabeledField label="Untertitel" optional={true}>
					<textarea
						{...register("subtitle")}
						placeholder="1-2 Sätze über diese Lerneinheit."
						rows={3}
					/>
				</LabeledField>

				<LabeledField label="Beschreibung" optional={true}>
					<textarea
						{...register("description")}
						placeholder="Beschreibung dieser Lernheit. Unterstützt Markdown."
						rows={6}
					/>

					<button
						type="button"
						className="btn-stroked text-sm"
						onClick={() => setOpenDescriptionEditor(true)}
					>
						Markdown Editor öffnen
					</button>

					{openDescriptionEditor && (
						<Controller
							control={control}
							name="description"
							render={({ field }) => (
								<MarkdownEditorDialog
									title="Beschreibung"
									onClose={v => {
										if (v) {
											setValue("description", v);
										}
										setOpenDescriptionEditor(false);
									}}
									initialValue={field.value ?? ""}
								/>
							)}
						/>
					)}
				</LabeledField>
				<AuthorsForm
					subtitle="Autoren dieser Lerneinheit."
					emptyString="Für diese Lerneinheit sind noch keine Autoren hinterlegt."
				/>
			</div>
		</div>
	);
}
