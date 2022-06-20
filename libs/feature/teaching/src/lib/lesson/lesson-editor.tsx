import { Prisma } from "@prisma/client";
import { LessonContent, QuestionType, QuizContent } from "@self-learning/types";
import { SectionCard, SectionHeader } from "@self-learning/ui/common";
import { EditorField, LabeledField, TextArea, Textfield } from "@self-learning/ui/forms";
import { CenteredContainer, CenteredSection } from "@self-learning/ui/layouts";
import { useState } from "react";
import slugify from "slugify";
import { transformFormData } from "../form-utils";
import { ImageUploadWidget } from "../image-upload";
import { getSupabaseUrl } from "../supabase";
import { LessonContentEditor } from "./lesson-content";
import { QuizEditor } from "./quiz-editor";

type Lesson = Prisma.LessonCreateInput;

function getQuiz(slug: string): QuestionType[] {
	return [
		{
			type: "multiple-choice",
			questionId: "923d78a5-af38-4599-980a-2b4cb62e4014",
			statement: `
			# How was your day?

			Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quasi molestias doloribus assumenda aspernatur in maxime numquam. Sint quas nobis voluptatum nemo consequatur aperiam ea sit eveniet, perferendis iure! Fugiat, optio!
			`.trim(),
			answers: [
				{
					answerId: "35d310ee-1acf-48e0-8f8c-090acd0e873a",
					content: "Good",
					isCorrect: true
				},
				{
					answerId: "cd33a2ef-95e8-4353-ad1d-de778d62ad57",
					content: "Bad",
					isCorrect: true
				}
			],
			hints: {
				content: [
					"Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero laudantium sequi illo, veritatis labore culpa, eligendi, quod consequatur autem ad dolorem explicabo quos alias harum fuga sapiente reiciendis. Incidunt, voluptates.",
					"# Lorem ipsum dolor \n- Eins\n- Zwei"
				]
			},
			withCertainty: true
		},
		{
			type: "short-text",
			questionId: "edbcf6a7-f9e9-4efe-b7ed-2bd0096c4e1d",
			statement: "# Was ist 1 + 1 ?",
			answers: null,
			withCertainty: true
		},
		{
			type: "text",
			questionId: "34fca2c2-c547-4f66-9a4e-927770a55090",
			statement: "# Was ist 1 + 1 ?",
			answers: null,
			withCertainty: true
		},
		{
			type: "cloze",
			questionId: "49497f71-8ed2-44a6-b36c-a44a4b0617d1",
			statement: "# Lückentext",
			answers: null,
			withCertainty: false,
			textArray: [""]
		},
		{
			type: "vorwissen",
			questionId: "c9de042a-6962-4f21-bc57-bf58841be5f2",
			statement: `lorem ipsum dolor sit amet consectetur adipisicing elit. **Quasi** molestias doloribus assumenda aspernatur in maxime numquam. Sint quas nobis voluptatum nemo consequatur aperiam ea sit eveniet, perferendis iure ? 
			![image](https://images.unsplash.com/photo-1523875194681-bedd468c58bf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1742&q=80)`,
			answers: [
				{
					answerId: "f797e6fc-8d03-41a2-9c93-9fcb3da0c147",
					content: "Statement 1",
					isCorrect: false
				},
				{
					answerId: "ef88d034-a0ea-4e85-bfc0-4381021f2449",
					content: "Statement 2",
					isCorrect: false
				},
				{
					answerId: "d0a1af94-92ea-4415-b1e3-cca7218b132a",
					content: "Statement 3",
					isCorrect: false
				},
				{
					answerId: "1220605d-e1b2-4933-bc7f-31b73c7a17bf",
					content: "Statement 4",
					isCorrect: false
				}
			],
			requireExplanationForAnswerIds: "ef88d034-a0ea-4e85-bfc0-4381021f2449",
			withCertainty: false
		},
		{
			type: "programming",
			answers: null,
			language: "typescript",
			questionId: "b6169fcf-3380-4062-9ad5-0af8826f2dfe",
			statement: `Implementiere einen Algorithmus, der als Eingabe eine Liste von Zahlen erhält und die Summe aller Zahlen in der Liste zurückgibt.
				## Beispiel

				**Eingabe**: \`[1, 2, 3, 4, 5]\`

				**Ausgabe**: \`15\`
				`,
			template:
				"export function sum(numbers: number[]): number {\n\t// DEINE LÖSUNG HIER\n\n\treturn 0;\t\t\n}",
			expectedOutput: "123",
			hints: {
				content: [
					"```ts\n// Verwende eine for-Schleife, um über alle Zahlen der Liste zu iterieren.\nfor (let i = 0; i < numbers.length; i++) {\n\t// DEINE LÖSUNG HIER\n}\n```"
				]
			}
		}
	];
}

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
	const [quiz, setQuiz] = useState<QuizContent>((lesson.quiz as QuizContent) ?? getQuiz(""));

	function slugifyTitle(overwrite?: boolean) {
		if (slug === "" || overwrite) {
			setSlug(slugify(title, { lower: true }));
		}
	}

	function onCreate(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const formData = new FormData(event.target as any);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const values = Object.fromEntries(formData as any);

		const transformed = transformFormData(values) as Lesson;

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
				<h1 className="text-3xl sm:text-5xl">
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

			<form onSubmit={onCreate} className="flex flex-col gap-32 bg-gray-50 pt-8 pb-24">
				<CenteredContainer>
					<button className="btn-primary ml-auto mr-0" type="submit">
						{isNew ? "Erstellen" : "Speichern"}
					</button>
					<SectionHeader title="Daten" subtitle="Informationen über diese Lerneinheit" />

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

									const { publicURL, error } = getSupabaseUrl("images", filepath);
									if (!error) {
										setImgUrl(publicURL as string);
									}
								}}
								size={256}
							/>
						</LabeledField>
					</SectionCard>
				</CenteredContainer>

				<LessonContentEditor content={content} setContent={setContent} />

				<QuizEditor quiz={quiz} setQuiz={setQuiz}></QuizEditor>

				<CenteredContainer>
					<button className="btn-primary mt-8 ml-auto mr-0 self-end" type="submit">
						{isNew ? "Erstellen" : "Speichern"}
					</button>
				</CenteredContainer>
			</form>
		</div>
	);
}
