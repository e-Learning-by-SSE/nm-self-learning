import { Combobox } from "@headlessui/react";
import { DocumentTextIcon, VideoCameraIcon } from "@heroicons/react/outline";
import { SearchIcon, XIcon } from "@heroicons/react/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEmptyLesson, LessonContentType, lessonSchema, Video } from "@self-learning/types";
import {
	Dialog,
	DialogActions,
	Divider,
	OnDialogCloseFn,
	Tab,
	Tabs
} from "@self-learning/ui/common";
import { EditorField, LabeledField, MarkdownEditorDialog, Upload } from "@self-learning/ui/forms";
import { VideoPlayer } from "@self-learning/ui/lesson";
import { formatSeconds } from "@self-learning/util/common";
import { Fragment, useState } from "react";
import {
	Controller,
	FormProvider,
	useFieldArray,
	useForm,
	useFormContext,
	useWatch
} from "react-hook-form";
import slugify from "slugify";
import { JsonEditorDialog } from "../../../json-editor-dialog";
import { useLessonContentEditor } from "../../../lesson/forms/lesson-content";
import { QuizEditor } from "../../../lesson/forms/quiz-editor";
import { LessonFormModel } from "../../../lesson/lesson-form-model";

export function EditLessonDialog({
	onClose,
	initialLesson
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	const [openJsonEditor, setOpenJsonEditor] = useState(false);
	const [selectedTab, setSelectedTab] = useState(0);
	const isNew = !initialLesson;

	const methods = useForm<LessonFormModel>({
		context: undefined,
		defaultValues: initialLesson ?? createEmptyLesson(),
		resolver: zodResolver(lessonSchema)
	});

	return (
		<Dialog
			title={isNew ? "Neue Lernheit erstellen" : "Lerneinheit anpassen"}
			onClose={onClose}
			style={{ height: "80vh", width: "80vw" }}
		>
			<button
				type="button"
				onClick={() => setOpenJsonEditor(true)}
				className="absolute right-8 top-8 text-xs font-semibold text-secondary"
			>
				Als JSON bearbeiten
			</button>
			<FormProvider {...methods}>
				<form
					id="lessonform"
					onSubmit={methods.handleSubmit(onClose, console.log)}
					className="flex h-full flex-col overflow-hidden"
				>
					{openJsonEditor && (
						<JsonEditorDialog
							validationSchema={lessonSchema}
							onClose={value => {
								console.log(value);
								setOpenJsonEditor(false);
							}}
						/>
					)}

					<div className="flex h-full flex-col gap-4 overflow-hidden">
						<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
							<Tab>Übersicht</Tab>
							<Tab>Lernkontrolle</Tab>
						</Tabs>

						<div className="playlist-scroll flex h-full flex-col gap-4 overflow-auto">
							{selectedTab === 0 && <Overview />}
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

	const {
		content,
		addContent,
		removeContent,
		contentTabIndex,
		setContentTabIndex,
		typesWithUsage
	} = useLessonContentEditor(control as any);

	function slugifyTitle() {
		const title = getValues("title");
		const slug = slugify(title, { lower: true });
		setValue("slug", slug);
	}

	const [openDescriptionEditor, setOpenDescriptionEditor] = useState(false);

	return (
		<div className="grid h-full gap-8 xl:grid-cols-3">
			<div className="col-span-2 flex flex-col gap-8 xl:col-span-1">
				<div className="flex h-full w-full flex-col gap-4 rounded-lg border border-light-border p-4">
					<h3 className="text-xl">Grunddaten</h3>

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
				</div>
			</div>

			<div className="col-span-2 flex flex-col gap-4 rounded-lg border border-light-border p-4">
				<h3 className="text-xl">Inhalt</h3>

				<div className="flex gap-4 text-xs">
					<button
						type="button"
						className="btn-stroked w-fit"
						onClick={() => addContent("video")}
						disabled={typesWithUsage["video"]}
					>
						<VideoCameraIcon className="h-5" />
						<span>Video</span>
					</button>

					<button
						type="button"
						className="btn-stroked w-fit"
						onClick={() => addContent("article")}
						disabled={typesWithUsage["article"]}
					>
						<DocumentTextIcon className="h-5" />
						<span>Artikel</span>
					</button>
				</div>

				{contentTabIndex !== undefined && content[contentTabIndex] ? (
					<>
						<Tabs selectedIndex={contentTabIndex} onChange={setContentTabIndex}>
							{content.map((value, index) => (
								<Tab key={value.id}>
									<span className="flex items-center gap-4">
										<span>{value.type}</span>
										<button
											type="button"
											title="Entfernen"
											onClick={() => removeContent(index)}
											className="rounded-full hover:bg-red-50 hover:text-red-500"
										>
											<XIcon className="h-4" />
										</button>
									</span>
								</Tab>
							))}
						</Tabs>
						<RenderContentType
							index={contentTabIndex}
							content={content[contentTabIndex]}
						/>
					</>
				) : (
					<div className="h-full rounded-lg border border-light-border bg-white py-16 text-center text-light">
						Diese Lerneinheit hat noch keinen Inhalt.
					</div>
				)}
			</div>
		</div>
	);
}

function RenderContentType({ index, content }: { index: number; content: LessonContentType }) {
	if (content.type === "video") {
		return <VideoInput index={index} />;
	}

	if (content.type === "article") {
		return <ArticleInput index={index} />;
	}

	return (
		<span className="text-red-500">
			Error: Unknown content type ({(content as { type: string | undefined }).type})
		</span>
	);
}

function ArticleInput({ index }: { index: number }) {
	return (
		<Controller
			name={`content.${index}.value.content`}
			render={({ field }) => <EditorField value={field.value} onChange={field.onChange} />}
		></Controller>
	);
}

export function VideoInput({ index }: { index: number }) {
	const { control } = useFormContext<{ content: Video[] }>();
	const { update } = useFieldArray<{ content: Video[] }>({
		name: "content"
	});

	const {
		value: { url },
		meta: { duration }
	} = useWatch({ control, name: `content.${index}` });

	return (
		<div className="flex flex-col gap-4">
			<p className="text-sm text-light">Video verlinken oder hochladen.</p>

			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-4 md:flex-row">
					<LabeledField label="URL">
						<input
							type={"text"}
							className="textfield w-full"
							value={url}
							onChange={e =>
								update(index, {
									type: "video",
									value: { url: e.target.value },
									meta: { duration: 0 }
								})
							}
						/>
					</LabeledField>

					<LabeledField label="Länge in Sekunden">
						<div className="flex">
							<input
								className="textfield w-full"
								type={"number"}
								placeholder="Länge des Videos in Sekunden"
								value={duration}
								onChange={e =>
									update(index, {
										type: "video",
										value: { url },
										meta: { duration: e.target.valueAsNumber }
									})
								}
							/>
							<span className="my-auto w-fit px-2 text-sm text-light">
								{formatSeconds(duration)}
							</span>
						</div>
					</LabeledField>
				</div>

				<Upload
					mediaType="video"
					preview={
						<div className="aspect-video w-full bg-black">
							{url ? <VideoPlayer url={url} /> : null}
						</div>
					}
					onUploadCompleted={(publicUrl, meta) => {
						update(index, {
							type: "video",
							value: { url: publicUrl },
							meta: { duration: meta?.duration ?? 0 }
						});
					}}
				/>
			</div>
		</div>
	);
}
