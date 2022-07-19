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
import { EditorField, LabeledField, MarkdownEditorDialog } from "@self-learning/ui/forms";
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
import { VideoUploadWidget } from "../../../image-upload";
import { JsonEditorDialog } from "../../../json-editor-dialog";
import { useLessonContentEditor } from "../../../lesson/forms/lesson-content";
import { QuizEditor } from "../../../lesson/forms/quiz-editor";
import { LessonFormModel } from "../../../lesson/lesson-form-model";
import { getSupabaseUrl } from "../../../supabase";

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
			<div className="flex flex-col gap-8">
				<div className="flex flex-col gap-4 rounded-lg border border-light-border p-4">
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
											setValue("description", v);
											setOpenDescriptionEditor(false);
										}}
										initialValue={field.value ?? ""}
									/>
								)}
							/>
						)}
					</LabeledField>
				</div>

				<div className="rounded-lg border border-light-border p-4">
					<h3 className="text-xl">Metadaten</h3>

					<LabeledField label="Tags">
						<textarea placeholder="Eins, Zwei, Drei" rows={4} />
					</LabeledField>
				</div>
			</div>

			<div className="flex flex-col gap-4 rounded-lg border border-light-border p-4">
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

			<Competencies />
		</div>
	);
}

function Competencies() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="flex h-full flex-col gap-4 rounded-lg border border-light-border p-4">
			<div className="flex flex-col gap-4">
				<span className="flex items-center justify-between gap-2">
					<h3 className="text-xl">Voraussetzungen</h3>
					<button
						type="button"
						className="text-sm text-secondary"
						onClick={() => setIsOpen(true)}
					>
						Hinzufügen
					</button>
				</span>

				<ul className="text-sm">
					<li>Lorem ipsum dolor sit (1)</li>
					<li>Lorem ipsum dolor sit (1)</li>
					<li>Lorem ipsum dolor sit (1)</li>
				</ul>
			</div>

			<Divider />

			<div className="flex flex-col gap-4">
				<span className="flex items-center justify-between gap-2">
					<h3 className="text-xl">Erworbene Kompetenzen</h3>
					<button
						type="button"
						className="text-sm text-secondary"
						onClick={() => setIsOpen(true)}
					>
						Hinzufügen
					</button>
				</span>

				<ul className="text-sm">
					<li>Lorem ipsum dolor sit (1)</li>
					<li>Lorem ipsum dolor sit (1)</li>
					<li>Lorem ipsum dolor sit (1)</li>
				</ul>
			</div>

			{isOpen && (
				<AddCompetenceDialog
					onClose={data => {
						setIsOpen(false);
						console.log(data);
					}}
				/>
			)}
		</div>
	);
}

function AddCompetenceDialog({ onClose }: { onClose: OnDialogCloseFn<any> }) {
	const [search, setSearch] = useState("");
	const [selectedValue, setSelectedValue] = useState("");
	const [filteredCompetencies, setfilteredCompetencies] = useState<any[]>([
		"Eins",
		"Zwei",
		"Drei"
	]);

	return (
		<Dialog title="Kompetenz hinzufügen" onClose={() => onClose(undefined)}>
			<div className="grid grid-cols-2">
				<div className="flex flex-col gap-8">
					<div>
						<Combobox value={selectedValue} onChange={setSelectedValue}>
							<span className="flex items-center rounded-lg border border-light-border py-1 px-3">
								<SearchIcon className="h-6 text-light" />
								<Combobox.Input
									className="w-full border-none focus:ring-0"
									placeholder="Suche nach Kompetenz"
									autoComplete="off"
									onChange={e => setSearch(e.target.value)}
								/>
							</span>
							<div className="divide-border-light playlist-scroll mt-2 flex flex-col divide-y overflow-auto">
								<Combobox.Options className="flex flex-col divide-y divide-light-border">
									{filteredCompetencies.map(comp => (
										<Combobox.Option value={comp} key={comp} as={Fragment}>
											{({ active }) => (
												<button
													type="button"
													className={`flex flex-col gap-1 rounded px-4 py-2 ${
														active ? "bg-secondary text-white" : ""
													}`}
												>
													<span className="text-sm font-medium ">
														{comp}
													</span>
													<span
														className={`text-xs font-normal ${
															active ? "text-white" : "text-light"
														}`}
													>
														in Java
													</span>
												</button>
											)}
										</Combobox.Option>
									))}
								</Combobox.Options>
							</div>
						</Combobox>
					</div>

					<Divider />

					<div className="flex flex-col gap-4">
						<h3 className="text-xl">Neue Kompetenz erstellen</h3>
						<LabeledField label="Titel">
							<input />
						</LabeledField>
					</div>
				</div>
			</div>
		</Dialog>
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
			render={({ field }) => (
				<EditorField label="Artikel" value={field.value} onChange={field.onChange} />
			)}
		></Controller>
	);
}

export function VideoInput({ index }: { index: number }) {
	const { control, register } = useFormContext<{ content: Video[] }>();
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

			<VideoUploadWidget
				url={url ?? null}
				onUrlChange={url =>
					update(index, {
						type: "video",
						value: { url },
						meta: { duration: 0 }
					})
				}
				onUpload={file => {
					console.log(file);

					const { publicURL, error } = getSupabaseUrl("videos", file.filepath);

					if (!error && publicURL) {
						update(index, {
							type: "video",
							value: { url: publicURL },
							meta: { duration: file.duration }
						});
					}
				}}
			/>

			<LabeledField label="Länge in Sekunden">
				<div className="grid grid-cols-[1fr_auto]">
					<input
						{...register(`content.${index}.meta.duration`)}
						placeholder="Länge des Videos in Sekunden."
					/>
					<span className="my-auto px-2 text-sm text-light">
						{formatSeconds(duration)}
					</span>
				</div>
			</LabeledField>
		</div>
	);
}
