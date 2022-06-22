import { LessonContent, QuizContent } from "@self-learning/types";
import { Form } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { JsonEditorDialog } from "../json-editor-dialog";
import { LessonContentEditor } from "./forms/lesson-content";
import { LessonInfoEditor } from "./forms/lesson-info";
import { QuizEditor } from "./forms/quiz-editor";

export type LessonFormModel = {
	lessonId: string;
	title: string;
	slug: string;
	subtitle: string;
	description: string;
	imgUrl: string;
	content: LessonContent;
	quiz: QuizContent;
};

export function LessonEditor({
	lesson,
	onConfirm
}: {
	lesson: LessonFormModel;
	onConfirm: (lesson: LessonFormModel) => void;
}) {
	const isNew = lesson.lessonId === "";
	const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);

	const methods = useForm<LessonFormModel>({
		defaultValues: {
			lessonId: lesson.lessonId,
			title: lesson.title,
			slug: lesson.slug,
			subtitle: lesson.subtitle,
			description: lesson.description,
			imgUrl: lesson.imgUrl,
			content: lesson.content,
			quiz: lesson.quiz
		}
	});

	function openAsJson() {
		const formValue = methods.getValues();
		console.log(JSON.stringify(formValue, null, 4));
		setIsJsonDialogOpen(true);
	}

	function setFromJsonDialog(value: LessonFormModel) {
		methods.reset(value);
	}

	return (
		<div className="bg-gray-50 pb-32">
			<FormProvider {...methods}>
				<form
					onSubmit={methods.handleSubmit(data => {
						console.log(data);
					})}
					className="flex flex-col"
				>
					<Form.Title
						title={
							isNew ? (
								<>
									Neue <span className="text-indigo-600">Lerneinheit</span>{" "}
									hinzufügen
								</>
							) : (
								<>
									<span className="text-indigo-600">{lesson.title}</span>{" "}
									editieren
								</>
							)
						}
						button={
							<button className="btn-primary h-fit w-fit" type="submit">
								{isNew ? "Erstellen" : "Speichern"}
							</button>
						}
						specialButtons={
							<button
								type="button"
								className="absolute bottom-16 text-sm font-semibold text-secondary"
								onClick={openAsJson}
							>
								Als JSON bearbeiten
								{isJsonDialogOpen && (
									<JsonEditorDialog
										initialValue={methods.getValues() as LessonFormModel}
										isOpen={isJsonDialogOpen}
										setIsOpen={setIsJsonDialogOpen}
										onClose={setFromJsonDialog}
									/>
								)}
							</button>
						}
					/>

					<Form.Container>
						<LessonInfoEditor />
						<LessonContentEditor />
						<QuizEditor />
						<CenteredContainer>
							<button className="btn-primary ml-auto mr-0 self-end" type="submit">
								{isNew ? "Erstellen" : "Speichern"}
							</button>
						</CenteredContainer>
					</Form.Container>
				</form>
			</FormProvider>
		</div>
	);
}
