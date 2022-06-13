import { DocumentTextIcon, VideoCameraIcon } from "@heroicons/react/solid";
import { Prisma } from "@prisma/client";
import { apiFetch } from "@self-learning/api";
import { SectionCard } from "@self-learning/ui/common";
import { EditorField, TextArea, Textfield } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import slugify from "slugify";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

function VideoPlayer({ url }: { url: string }) {
	return <ReactPlayer url={url} height="100%" width="100%" controls={true} />;
}

async function createLesson(lesson: Lesson) {
	return apiFetch<Lesson, Lesson>("POST", "/api/teachers/lessons/create", lesson);
}

export default function CreateLessonPage() {
	async function onConfirm(lesson: Lesson) {
		const result = await createLesson(lesson);

		console.log(result);
	}

	return (
		<LessonEditor
			onConfirm={onConfirm}
			lesson={{
				lessonId: "",
				slug: "",
				title: "",
				subtitle: "",
				description: "",
				content: []
			}}
		/>
	);
}

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
	const [content, setContent] = useState<ContentType[]>([
		{
			type: "article",
			rndId: "abc",
			value: { content: "# Hello World\nInhalt der neuen Lerneinheit\n#Thema 1\nThema 1..." }
		}
	]);

	function slugifyTitle(overwrite?: boolean) {
		if (slug === "" || overwrite) {
			setSlug(slugify(title, { lower: true }));
		}
	}

	function onCreate() {
		onConfirm({
			title,
			slug,
			subtitle,
			description,
			content,
			lessonId: ""
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

type Video = { type: "video"; rndId: string; value: { url?: string } };
type Article = { type: "article"; rndId: string; value: { content?: string } };
type ContentType = Video | Article;

type InferContentType<CType extends ContentType["type"], Union = ContentType> = Union extends {
	type: CType;
}
	? Union
	: never;

type ValueByContentType<CType extends ContentType["type"]> = InferContentType<CType>["value"];

type SetValueFn = <CType extends ContentType["type"]>(
	type: CType,
	rndKey: string,
	value: ValueByContentType<CType> | undefined
) => void;

function LessonContent({
	content,
	setContent
}: {
	content: ContentType[];
	setContent: Dispatch<SetStateAction<ContentType[]>>;
}) {
	function addContent(type: ContentType["type"]) {
		let initialValue: ContentType["value"];

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
				rndId: Math.random().toString(16).slice(2),
				value: initialValue as any
			}
		]);
	}

	const onRemove = useCallback(
		(rndId: string) => {
			const confirmed = window.confirm("Inhalt entfernen ?");

			if (confirmed) {
				setContent(prev => prev.filter(item => item.rndId !== rndId));
			}
		},
		[setContent]
	);

	function setValue(type: string, rndId: string, value: unknown) {
		const index = content.findIndex(i => i.rndId === rndId);

		if (index >= 0) {
			const copy = [...content];
			(copy[index] as { value: unknown }).value = value;
			setContent(copy);
		}
	}

	return (
		<div className="grid gap-16">
			{content.length > 0 && (
				<div className="grid gap-8">
					{content.map(content => (
						<RenderContentType
							key={content.rndId}
							content={content}
							onRemove={onRemove}
							setValue={setValue}
						/>
					))}
				</div>
			)}

			<div className="flex gap-8">
				<button
					className="flex place-content-center place-items-center gap-2 rounded-lg bg-red-500 px-8 py-2 font-semibold text-white"
					onClick={() => addContent("video")}
				>
					<VideoCameraIcon className="h-5" />
					<span>Youtube</span>
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
	content,
	onRemove,
	setValue
}: {
	content: ContentType;
	setValue: SetValueFn;
	onRemove: (rndId: string) => void;
}) {
	if (content.type === "video") {
		return (
			<YoutubeVideoInput
				video={content}
				setValue={setValue}
				remove={() => onRemove(content.rndId)}
			/>
		);
	}

	if (content.type === "article") {
		return (
			<ArticleInput
				article={content}
				setValue={setValue}
				onRemove={() => onRemove(content.rndId)}
			/>
		);
	}

	return (
		<span className="text-red-500">
			Error: Unknown content type ({(content as { type: string | undefined }).type})
		</span>
	);
}

function YoutubeVideoInput({
	video,
	setValue,
	remove
}: {
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
				<span className="text-xl font-semibold">YouTube</span>
				<span className="text-light">Embed a YouTube Video.</span>
			</div>

			<Textfield
				name="mediaType"
				label="Medientyp"
				required={true}
				value={"video"}
				disabled={true}
			/>

			<Textfield
				name="url"
				label="URL"
				required={true}
				value={video.value.url}
				onChange={event => setValue("video", video.rndId, { url: event.target.value })}
				placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
			/>
			<div className="aspect-video max-h-[512px] grow-0 bg-black">
				{video.value.url && video.value.url.length > 0 && (
					<VideoPlayer url={video.value.url} />
				)}
			</div>
		</div>
	);
}

function ArticleInput({
	onRemove,
	article,
	setValue
}: {
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
				onChange={v => setValue(article.type, article.rndId, { content: v })}
				value={article.value.content}
			/>
		</div>
	);
}
