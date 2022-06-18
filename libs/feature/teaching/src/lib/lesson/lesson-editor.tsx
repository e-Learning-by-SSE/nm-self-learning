import { Prisma } from "@prisma/client";
import { LessonContent, QuizContent } from "@self-learning/types";
import { SectionCard, SectionHeader } from "@self-learning/ui/common";
import { EditorField, LabeledField, TextArea, Textfield } from "@self-learning/ui/forms";
import { CenteredContainer, CenteredSection } from "@self-learning/ui/layouts";
import { useState } from "react";
import slugify from "slugify";
import { ImageUploadWidget } from "../image-upload";
import { getSupabaseUrl } from "../supabase";
import { LessonContentEditor } from "./lesson-content";
import { QuizEditor } from "./quiz-editor";

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
	const [quiz, setQuiz] = useState<QuizContent>((lesson.quiz as QuizContent) ?? []);

	function slugifyTitle(overwrite?: boolean) {
		if (slug === "" || overwrite) {
			setSlug(slugify(title, { lower: true }));
		}
	}

	function onCreate() {
		const confirmed = window.confirm(`${lesson.title || "Lerneinheit"} wirklich erstellen?`);

		if (confirmed) {
			onConfirm({
				lessonId: "",
				title,
				slug,
				subtitle,
				description,
				content,
				imgUrl,
				quiz
			});
		}
	}

	return (
		<div className="bg-gray-50 pb-24">
			<CenteredSection className="bg-white">
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

			<div className="flex flex-col gap-32 bg-gray-50 pt-8 pb-24">
				<CenteredContainer>
					<button className="btn-primary ml-auto mr-0" onClick={onCreate}>
						{isNew ? "Erstellen" : "Speichern"}
					</button>

					<CenteredContainer>
						<SectionHeader
							title="Daten"
							subtitle="Informationen über diese Lerneinheit"
						/>

						<SectionCard className="gap-8">
							<Textfield
								value={title}
								onChange={e => setTitle(e.target.value)}
								label="Titel"
								name="title"
								required={true}
								placeholder="Die Neue Lerneinheit"
								onBlur={() => slugifyTitle()}
							/>

							<div className="grid items-start gap-2 sm:flex">
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
								height="128px"
							/>

							<LabeledField label="Bild">
								<ImageUploadWidget
									url={imgUrl}
									onUpload={filepath => {
										console.log(filepath);

										const { publicURL, error } = getSupabaseUrl(
											"images",
											filepath
										);
										if (!error) {
											setImgUrl(publicURL as string);
										}
									}}
									size={256}
								/>
							</LabeledField>
						</SectionCard>
					</CenteredContainer>
				</CenteredContainer>

				<LessonContentEditor content={content} setContent={setContent} />

				<QuizEditor quiz={quiz} setQuiz={setQuiz}></QuizEditor>

				<CenteredContainer>
					<button className="btn-primary mt-8 ml-auto mr-0 self-end" onClick={onCreate}>
						{isNew ? "Erstellen" : "Speichern"}
					</button>
				</CenteredContainer>
			</div>
		</div>
	);
}
