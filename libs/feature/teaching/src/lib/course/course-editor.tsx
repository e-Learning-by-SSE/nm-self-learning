import { zodResolver } from "@hookform/resolvers/zod";
import { Tab, Tabs } from "@self-learning/ui/common";
import { Form } from "@self-learning/ui/forms";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { JsonEditorDialog } from "../json-editor-dialog";
import { CourseContentForm } from "./course-content-editor/course-content-form";
import { CourseFormModel, courseFormSchema } from "./course-form-model";
import { CourseInfoForm } from "./course-info-form";

export function CourseEditor({
	course,
	onConfirm
}: {
	course: CourseFormModel;
	onConfirm: (course: CourseFormModel) => void;
}) {
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [openAsJson, setOpenAsJson] = useState(false);
	const isNew = course.courseId === "";

	const methods = useForm<CourseFormModel>({
		defaultValues: { ...course },
		resolver: zodResolver(courseFormSchema)
	});

	function onJsonDialogClose(value: CourseFormModel | undefined) {
		if (value) {
			methods.reset(value);
		}

		setOpenAsJson(false);
	}

	return (
		<div className="bg-gray-50 pb-32">
			<FormProvider {...methods}>
				<form
					id="courseform"
					onSubmit={e => {
						if ((e.target as any)["id"] === "courseform") {
							methods.handleSubmit(
								data => {
									console.log("data", data);
									try {
										const validated = courseFormSchema.parse(data);
										onConfirm(validated);
									} catch (error) {
										console.error(error);
									}
								},
								invalid => {
									console.log("invalid", invalid);
								}
							);
						}
					}}
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
								{openAsJson && <JsonEditorDialog onClose={onJsonDialogClose} />}
							</button>
						}
					/>

					<CenteredContainer className="mb-8">
						<Tabs
							selectedIndex={selectedTabIndex}
							onChange={index => setSelectedTabIndex(index)}
						>
							<Tab>Grunddaten</Tab>
							<Tab>Inhalt</Tab>
						</Tabs>
					</CenteredContainer>

					{selectedTabIndex === 0 && <CourseInfoForm />}
					{selectedTabIndex === 1 && <CourseContentForm />}

					<CenteredContainer className="mt-16">
						<button className="btn-primary ml-auto mr-0 self-end" type="submit">
							{isNew ? "Erstellen" : "Speichern"}
						</button>
					</CenteredContainer>
				</form>
			</FormProvider>
		</div>
	);
}
