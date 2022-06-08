import { PlusIcon } from "@heroicons/react/solid";
import { SectionCard } from "@self-learning/ui/common";
import { TextArea, Textfield } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import { useMemo, useState } from "react";
import slugify from "slugify";

export default function CreateLessonPage() {
	const [title, setTitle] = useState("");
	const [slug, setSlug] = useState("");

	function slugifyTitle() {
		if (slug === "") {
			setSlug(slugify(title));
		}
	}

	return (
		<div>
			<CenteredSection>
				<h1 className="text-5xl">
					Neue <span className="text-indigo-600">Lerneinheit</span> hinzufügen
				</h1>
			</CenteredSection>

			<CenteredSection className="bg-gray-50">
				<button className="btn-primary mb-12 ml-auto mr-0">Erstellen</button>
				<div className="grid items-start gap-16">
					<SectionCard title="Daten" subtitle="Informationen über die neue Lerneinheit.">
						<Textfield
							value={title}
							onChange={e => setTitle(e.target.value)}
							label="Titel"
							name="title"
							required={true}
							placeholder="Die Neue Lerneinheit"
							onBlur={slugifyTitle}
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
							<button className="btn-stroked h-fit self-end" onClick={slugifyTitle}>
								Generieren
							</button>
						</div>
						<TextArea
							label="Untertitel"
							name="subtitle"
							placeholder="1-2 Sätze über diese Lerneinheit."
							required={true}
						></TextArea>
						<TextArea
							label="Beschreibung"
							name="description"
							placeholder="Eine längere Beschreibung dieser Lerneinheit. Unterstützt Markdown."
							rows={4}
						></TextArea>
					</SectionCard>

					<SectionCard
						title="Inhalt"
						subtitle="Inhalt, der zur Wissensvermittlung genutzt werden soll. Wenn mehrere Elemente angelegt werden, kann der Student selber entscheiden, welches Medium angezeigt werden soll."
					>
						<LessonContent />
					</SectionCard>
				</div>
			</CenteredSection>
		</div>
	);
}

type ContentTypes = { type: "YouTube"; rndId: string; url: string };

function LessonContent() {
	const [content, setContent] = useState<ContentTypes[]>([]);

	function addContent(type: ContentTypes["type"]) {
		setContent(prev => [
			...prev,
			{
				type,
				rndId: Math.random().toString(16).slice(2),
				url: ""
			}
		]);
	}

	function removeContent(rndId: string) {
		setContent(prev => prev.filter(item => item.rndId !== rndId));
	}

	function setUrl(rndId: string, url: string) {
		const index = content.findIndex(i => i.rndId === rndId);

		if (index >= 0) {
			const copy = [...content];
			copy[index].url = url;
			setContent(copy);
		}
	}

	return (
		<div className="grid gap-16">
			{content.length > 0 && (
				<div className="grid gap-8">
					{content.map(content => (
						<YoutubeVideoInput
							key={content.rndId}
							url={content.url}
							setUrl={setUrl}
							rndId={content.rndId}
							remove={() => removeContent(content.rndId)}
						/>
					))}
				</div>
			)}

			<div className="flex gap-8">
				<button
					className="flex place-content-center place-items-center gap-2 rounded-lg bg-red-500 px-8 py-2 font-semibold text-white"
					onClick={() => addContent("YouTube")}
				>
					<PlusIcon className="h-5" />
					<span>Youtube</span>
				</button>
			</div>
		</div>
	);
}

function YoutubeVideoInput({
	url,
	setUrl,
	rndId,
	remove
}: {
	url?: string;
	rndId: string;
	setUrl: (rndId: string, url: string) => void;
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
				value="Video"
				disabled={true}
			/>

			<Textfield
				name="url"
				label="URL"
				required={true}
				value={url}
				onChange={event => setUrl(rndId, event.target.value)}
				placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
			/>
			<div className="aspect-video max-h-[512px] grow-0 bg-black">
				{url && url.length > 0 && <YoutubeEmbed url={url} />}
			</div>
		</div>
	);
}

function YoutubeEmbed({ url }: { url: string }) {
	const videoId = useMemo(() => url.match(/\?v=(.+)$/)?.at(1), [url]);

	return (
		<iframe
			height="100%"
			width="100%"
			src={`https://www.youtube-nocookie.com/embed/${videoId}`}
			title="YouTube video player"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen
		></iframe>
	);
}
