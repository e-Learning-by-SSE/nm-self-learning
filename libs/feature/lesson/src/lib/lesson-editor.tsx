import { DialogActions, OnDialogCloseFn, showToast, Tab, Tabs } from "@self-learning/ui/common";
import { LessonFormModel } from "@self-learning/teaching";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { useState } from "react";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { createEmptyLesson, lessonSchema } from "@self-learning/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { OpenAsJsonButton } from "../../../teaching/src/lib/json-editor-dialog";
import { LessonContentEditor } from "../../../teaching/src/lib/lesson/forms/lesson-content";
import { QuizEditor } from "../../../teaching/src/lib/lesson/forms/quiz-editor";
import slugify from "slugify";
import { SidebarSectionTitle } from "../../../../ui/forms/src/lib/form-container";
import { LabeledField, MarkdownEditorDialog, MarkdownField } from "@self-learning/ui/forms";
import { AuthorsForm } from "../../../teaching/src/lib/author/authors-form";

export async function onLessonCreatorClosed(
	onClose: () => void,
	createLessonAsync: (lesson: LessonFormModel) => any,
	lesson?: LessonFormModel
) {
	if (!lesson) {
		onClose();
		return;
	}
	try {
		console.log("Creating lesson...", lesson);
		const result = await createLessonAsync(lesson);
		showToast({ type: "success", title: "Lernheit erstellt", subtitle: result.title });
		onClose();
	} catch (error) {
		console.error(error);
		showToast({
			type: "error",
			title: "Fehler",
			subtitle: "Lerneinheit konnte nicht erstellt werden."
		});
	}
}

export async function onLessonEditorClosed(
	onClose: () => void,
	editLessonAsync: (lesson: any) => any,
	lesson?: LessonFormModel
) {
	if (!lesson) {
		onClose();
		return;
	}

	try {
		const result = await editLessonAsync({
			lesson: lesson,
			lessonId: lesson.lessonId as string
		});
		showToast({
			type: "success",
			title: "Lerneinheit gespeichert!",
			subtitle: result.title
		});
		onClose();
	} catch (error) {
		showToast({
			type: "error",
			title: "Fehler",
			subtitle: "Die Lernheit konnte nicht gespeichert werden."
		});
	}
}

export function LessonEditor({
	onClose,
	initialLesson
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	const session = useRequiredSession();
	const [selectedTab, setSelectedTab] = useState(0);
	const form = useForm<LessonFormModel>({
		context: undefined,
		defaultValues: initialLesson ?? {
			...createEmptyLesson(),
			// Add current user as author
			authors: session.data?.user.isAuthor ? [{ username: session.data.user.name }] : []
		},
		resolver: zodResolver(lessonSchema)
	});

	return (
		<FormProvider {...form}>
			<div className="absolute right-8 top-8 flex gap-4">
				<OpenAsJsonButton form={form} validationSchema={lessonSchema} />
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
			<form
				id="lessonform"
				onSubmit={form.handleSubmit(onClose, console.log)}
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

				<LabeledField label="Untertitel" error={errors.subtitle?.message} optional={true}>
					<Controller
						control={control}
						name="subtitle"
						render={({ field }) => (
							<MarkdownField
								content={field.value as string}
								setValue={field.onChange}
								inline={true}
								placeholder="1-2 Sätze über diese Lerneinheit."
							/>
						)}
					></Controller>
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
										if (v !== undefined) {
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
