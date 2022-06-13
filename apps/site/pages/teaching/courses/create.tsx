import { apiFetch } from "@self-learning/api";
import { SectionCard } from "@self-learning/ui/common";
import { EditorField, TextArea, Textfield } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import { useState } from "react";
import slugify from "slugify";

async function createCourse(course: any) {
	return apiFetch("POST", "/api/teachers/courses/create");
}

export default function CreateCoursePage() {
	const [title, setTitle] = useState("ABC");
	const [subtitle, setSubtitle] = useState("abcs");
	const [slug, setSlug] = useState("abc");
	const [description, setDescription] = useState<string | undefined>("sdsdsdsddfgfgfg");
	const [content, setContent] = useState<any[]>([]);

	function slugifyTitle() {
		if (slug === "") {
			setSlug(slugify(title, { lower: true }));
		}
	}

	async function onCreate() {
		const result = await createCourse({
			title,
			subtitle,
			slug,
			description
		});

		console.log(result);
	}

	return (
		<>
			<CenteredSection>
				<h1 className="text-5xl">
					Neuen <span className="text-indigo-600">Kurs</span> hinzufügen
				</h1>
			</CenteredSection>

			<CenteredSection className="bg-gray-50 pt-8">
				<button className="btn-primary mb-8 ml-auto mr-0" onClick={onCreate}>
					Erstellen
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
								<button
									className="btn-stroked h-fit self-end"
									onClick={slugifyTitle}
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
								value={description}
								onChange={setDescription}
								language="markdown"
							/>
						</div>
					</SectionCard>

					<SectionCard
						title="Inhalt"
						subtitle="Hier können Lerneinheiten hinzugefügt und durch Kapitel strukturiert werden."
					>
						<CourseContent content={content} setContent={setContent} />
					</SectionCard>
				</div>
				<button className="btn-primary mt-8 ml-auto mr-0" onClick={onCreate}>
					Erstellen
				</button>
			</CenteredSection>
		</>
	);
}

function CourseContent({
	content,
	setContent
}: {
	content: any;
	setContent: (value: any) => void;
}) {
	return <div className="flex flex-col">content.</div>;
}
