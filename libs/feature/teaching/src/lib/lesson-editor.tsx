import { DocumentTextIcon, VideoCameraIcon } from "@heroicons/react/solid";
import { Prisma } from "@prisma/client";
import {
	Article,
	LessonContent,
	LessonContentType,
	ValueByContentType,
	Video
} from "@self-learning/types";
import { SectionCard } from "@self-learning/ui/common";
import { EditorField, TextArea, Textfield } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import slugify from "slugify";
import { ImageUploadWidget, VideoUploadWidget } from "./image-upload";
import { getSupabaseUrl } from "./supabase";

type Lesson = Prisma.LessonCreateInput;

export function LessonEditor({
	lesson,
	onConfirm
}: {
	lesson: Lesson;
	onConfirm: (lesson: Lesson) => void;
}) {
	const isNew = lesson.lessonId === "";

	const [title, setTitle] = useState(lesson.title);
	const [slug, setSlug] = useState(lesson.slug);
	const [subtitle, setSubtitle] = useState(lesson.subtitle ?? "");
	const [description, setDescription] = useState(lesson.description);
	const [content, setContent] = useState<LessonContent>(lesson.content as LessonContent);
	const [imgUrl, setImgUrl] = useState<string | null>(lesson.imgUrl ?? null);

	function slugifyTitle(overwrite?: boolean) {
		if (slug === "" || overwrite) {
			setSlug(slugify(title, { lower: true }));
		}
	}

	function onCreate() {
		onConfirm({
			lessonId: "",
			title,
			slug,
			subtitle,
			description,
			content,
			imgUrl,
			quiz: null
		});
	}

	return (
		<div>
			<CenteredSection>
				<h1 className="text-5xl">
					{isNew ? (
						<>
							Neue <span className="text-indigo-600">Lerneinheit</span> hinzufügen
						</>
					) : (
						<>
							<span className="text-indigo-600">{lesson.title}</span> editieren
						</>
					)}
				</h1>
			</CenteredSection>

			{/* <CenteredSection className="bg-indigo-100">
				<ImageUploadWidget
					url={imgUrl}
					onUpload={filepath => {
						console.log(filepath);

						const { publicURL, error } = getSupabaseUrl("images", filepath);
						if (!error) {
							setImgUrl(publicURL as string);
						}
					}}
					size={256}
				/>
			</CenteredSection> */}

			<CenteredSection className="bg-gray-50 pt-8">
				<button className="btn-primary mb-8 ml-auto mr-0" onClick={onCreate}>
					{isNew ? "Erstellen" : "Speichern"}
				</button>
				<div className="grid items-start gap-16">
					<SectionCard title="Daten" subtitle="Informationen über die neue Lerneinheit.">
						<div className="flex flex-col gap-8">
							<Textfield
								value={title}
								onChange={e => setTitle(e.target.value)}
								label="Titel"
								name="title"
								required={true}
								placeholder="Die Neue Lerneinheit"
								onBlur={() => slugifyTitle()}
							/>
							<div className="flex gap-2">
								<Textfield
									value={slug}
									onChange={e => setSlug(e.target.value)}
									label="Slug"
									name="slug"
									required={true}
									placeholder='Wird in der URL angezeigt, z. B.: "die-neue-lerneinheit"'
								/>
								<button
									className="btn-stroked h-fit self-end"
									onClick={() => slugifyTitle(true)}
								>
									Generieren
								</button>
							</div>
							<TextArea
								label="Untertitel"
								name="subtitle"
								placeholder="1-2 Sätze über diese Lerneinheit."
								required={true}
								value={subtitle}
								onChange={e => setSubtitle(e.target.value)}
							></TextArea>
							<EditorField
								label="Beschreibung"
								value={description as string}
								onChange={setDescription}
								language="markdown"
							/>
						</div>
					</SectionCard>

					<SectionCard
						title="Inhalt"
						subtitle="Inhalt, der zur Wissensvermittlung genutzt werden soll. Wenn mehrere Elemente angelegt werden, kann der Student selber entscheiden, welches Medium angezeigt werden soll."
					>
						<LessonContent content={content} setContent={setContent} />
					</SectionCard>
				</div>
				<button className="btn-primary mt-8 ml-auto mr-0" onClick={onCreate}>
					{isNew ? "Erstellen" : "Speichern"}
				</button>
			</CenteredSection>
		</div>
	);
}

type SetValueFn = <CType extends LessonContentType["type"]>(
	type: CType,
	value: ValueByContentType<CType> | undefined,
	index: number
) => void;

function LessonContent({
	content,
	setContent
}: {
	content: LessonContentType[];
	setContent: Dispatch<SetStateAction<LessonContentType[]>>;
}) {
	function addContent(type: LessonContentType["type"]) {
		let initialValue: LessonContentType["value"];

		if (type === "article") {
			initialValue = { content: "" };
		}

		if (type === "video") {
			initialValue = { url: "" };
		}

		setContent(prev => [
			...prev,
			{
				type,
				value: initialValue as any
			}
		]);
	}

	const onRemove = useCallback(
		(index: number) => {
			const confirmed = window.confirm("Inhalt entfernen ?");

			if (confirmed) {
				setContent(prev => prev.filter((item, i) => index !== i));
			}
		},
		[setContent]
	);

	function setValue(type: string, value: unknown, index: number) {
		if (index >= 0 && index < content.length) {
			const copy = [...content];
			(copy[index] as { value: unknown }).value = value;
			setContent(copy);
		}
	}

	return (
		<div className="grid gap-16">
			{content.length > 0 && (
				<div className="grid gap-8">
					{content.map((content, index) => (
						<RenderContentType
							key={index}
							index={index}
							content={content}
							onRemove={onRemove}
							setValue={setValue}
						/>
					))}
				</div>
			)}

			<div className="flex gap-4">
				<button
					className="flex place-content-center place-items-center gap-2 rounded-lg bg-emerald-500 px-8 py-2 font-semibold text-white"
					onClick={() => addContent("video")}
				>
					<VideoCameraIcon className="h-5" />
					<span>Video</span>
				</button>

				<button
					className="flex place-content-center place-items-center gap-2 rounded-lg bg-blue-500 px-8 py-2 font-semibold text-white"
					onClick={() => addContent("article")}
				>
					<DocumentTextIcon className="h-5" />
					<span>Artikel</span>
				</button>
			</div>
		</div>
	);
}

function RenderContentType({
	index,
	content,
	onRemove,
	setValue
}: {
	index: number;
	content: LessonContentType;
	setValue: SetValueFn;
	onRemove: (index: number) => void;
}) {
	if (content.type === "video") {
		return (
			<VideoInput
				index={index}
				video={content}
				setValue={setValue}
				remove={() => onRemove(index)}
			/>
		);
	}

	if (content.type === "article") {
		return (
			<ArticleInput
				index={index}
				article={content}
				setValue={setValue}
				onRemove={() => onRemove(index)}
			/>
		);
	}

	return (
		<span className="text-red-500">
			Error: Unknown content type ({(content as { type: string | undefined }).type})
		</span>
	);
}

function VideoInput({
	index,
	video,
	setValue,
	remove
}: {
	index: number;
	video: Video;
	setValue: SetValueFn;
	remove: () => void;
}) {
	return (
		<div className="card relative flex flex-col gap-8 border border-light-border">
			<button className="absolute w-fit self-end text-sm text-red-500" onClick={remove}>
				Entfernen
			</button>
			<div className="grid items-start gap-2">
				<span className="text-xl font-semibold">Video</span>
				<span className="text-light">
					Verlinke ein Video oder lade ein neues Video hoch.
				</span>
			</div>

			<Textfield
				name="url"
				label="URL"
				required={true}
				value={video.value.url}
				onChange={event => setValue("video", { url: event.target.value }, index)}
				placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
			/>

			<VideoUploadWidget
				url={video.value.url as string}
				onUpload={filepath => {
					console.log(filepath);

					const { publicURL, error } = getSupabaseUrl("videos", filepath);
					if (!error) {
						setValue("video", { url: publicURL as string }, index);
					}
				}}
			/>
		</div>
	);
}

function ArticleInput({
	index,
	onRemove,
	article,
	setValue
}: {
	index: number;
	setValue: SetValueFn;
	article: Article;
	onRemove: () => void;
}) {
	return (
		<div className="card relative flex flex-col gap-8 border border-light-border">
			<button className="absolute w-fit self-end text-sm text-red-500" onClick={onRemove}>
				Entfernen
			</button>
			<div className="grid items-start gap-2">
				<span className="text-xl font-semibold">Artikel</span>
				<span className="text-light">Schreibe einen Artikel. Unterstützt Markdown.</span>
			</div>

			<EditorField
				label="Inhalt"
				language="markdown"
				onChange={v => setValue(article.type, { content: v }, index)}
				value={article.value.content}
			/>
		</div>
	);
}
