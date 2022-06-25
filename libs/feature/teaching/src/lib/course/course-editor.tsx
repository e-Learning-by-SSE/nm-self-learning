import { yupResolver } from "@hookform/resolvers/yup";
import { Form } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { JsonEditorDialog } from "../json-editor-dialog";
import { CourseContentForm } from "./course-content-form";
import { CourseFormModel, courseFormSchema } from "./course-form-model";
import { CourseInfoForm } from "./course-info-form";

export function CourseEditor({ course }: { course: CourseFormModel }) {
	const [openAsJson, setOpenAsJson] = useState(false);
	const isNew = course.courseId === "";

	const methods = useForm<CourseFormModel>({
		defaultValues: { ...course },
		resolver: yupResolver(courseFormSchema)
	});

	function onJsonDialogClose(value: CourseFormModel) {
		methods.reset(value);
	}

	return (
		<div className="bg-gray-50 pb-32">
			<FormProvider {...methods}>
				<form
					onSubmit={methods.handleSubmit(
						data => {
							console.log("data", data);
							try {
								courseFormSchema.validateSync(data);
							} catch (error) {
								console.error(error);
							}
						},
						invalid => {
							console.log("invalid", invalid);
						}
					)}
				>
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
