import { Form } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { JsonEditorDialog } from "../json-editor-dialog";
import { CourseContentForm } from "./course-content-form";
import { CourseInfoForm } from "./course-info-form";

export type CourseFormModel = {
	courseId: string;
	slug: string;
	title: string;
	subtitle: string;
	description: string | null;
	imgUrl: string | null;
	content: {
		chapterId: string;
		title: string;
		description: string | null;
		lessons: {
			title: string;
			slug: string;
			lessonId: string;
		}[];
	}[];
	subjectId: number;
};

export function CourseEditor({ course }: { course: CourseFormModel }) {
	const [openAsJson, setOpenAsJson] = useState(false);
	const isNew = course.courseId === "";

	const methods = useForm<CourseFormModel>({
		defaultValues: { ...course }
	});

	function onJsonDialogClose(value: CourseFormModel) {
		methods.reset(value);
	}

	return (
		<div className="bg-gray-50 pb-32">
			<FormProvider {...methods}>
				<form>
					<Form.Title
						title={
							isNew ? (
								<>
									Neuen <span className="text-indigo-600">Kurs</span> hinzufügen
								</>
							) : (
								<>
									<span className="text-indigo-600">{course.title}</span>{" "}
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
								onClick={() => setOpenAsJson(true)}
							>
								<span>Als JSON bearbeiten</span>
								{openAsJson && (
									<JsonEditorDialog
										initialValue={methods.getValues() as CourseFormModel}
										isOpen={openAsJson}
										setIsOpen={setOpenAsJson}
										onClose={onJsonDialogClose}
									/>
								)}
							</button>
						}
					/>

					<Form.Container>
						<CourseInfoForm />
						<CourseContentForm />
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
