"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogActions, SectionHeader } from "@self-learning/ui/common";
import { Form, MarkdownField, OpenAsJsonButton } from "@self-learning/ui/forms";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import Link from "next/link";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { AuthorsForm } from "../author/authors-form";
import { CourseContentForm } from "./course-content-editor/course-content-form";
import { CourseFormModel, courseFormSchema } from "./course-form-model";
import { CourseInfoForm } from "./course-info-form";
import { useRouter } from "next/router";
import { GroupAccessEditor } from "../group/forms/group-form";

export function CourseEditor({
	course,
	onConfirm
}: {
	course: CourseFormModel;
	onConfirm: (course: CourseFormModel) => void;
}) {
	const router = useRouter();

	const isNew = course.courseId === "";

	const form = useForm<CourseFormModel>({
		defaultValues: { ...course },
		resolver: zodResolver(courseFormSchema)
	});

	function onCancel() {
		if (window.confirm("Änderungen verwerfen?")) {
			router.back();
		}
	}

	return (
		<FormProvider {...form}>
			<form
				id="courseform"
				onSubmit={e => {
					if ((e.target as unknown as { id: string }).id === "courseform") {
						form.handleSubmit(
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
						)(e);
					}
				}}
			>
				<SidebarEditorLayout
					sidebar={
						<>
							<div>
								<span className="font-semibold text-c-primary">
									{isNew ? "Kurs erstellen" : "Kurs bearbeiten"}
								</span>

								<Link href={`/courses/${course.slug}`} target="_blank">
									<h1 className="text-2xl">{course.title}</h1>
								</Link>
							</div>

							<OpenAsJsonButton form={form} validationSchema={courseFormSchema} />
							<CourseInfoForm />
							<GroupAccessEditor
								subtitle="Gruppen, die auf diesen Kurs zugreifen können"
								fillInSingleGroup={isNew}
							/>
							<AuthorsForm
								subtitle="Die Autoren dieses Kurses."
								emptyString="Für diesen Kurs sind noch keine Autoren hinterlegt."
							/>
						</>
					}
				>
					<CourseDescriptionForm />
					<CourseContentForm />
				</SidebarEditorLayout>
				<div className="pointer-events-none fixed bottom-0 flex w-full items-end justify-end pb-[20px]">
					<div className="z-50 pr-5 pb-5">
						<DialogActions onClose={onCancel}>
							<button type="submit" className="btn-primary pointer-events-auto">
								{isNew ? "Erstellen" : "Speichern"}
							</button>
						</DialogActions>
					</div>
				</div>
			</form>
		</FormProvider>
	);
}

function CourseDescriptionForm() {
	const { control } = useFormContext<{ description: CourseFormModel["description"] }>();

	return (
		<section>
			<SectionHeader
				title="Beschreibung"
				subtitle="Ausführliche Beschreibung dieses Kurses. Unterstützt Markdown."
			/>
			<Form.MarkdownWithPreviewContainer>
				<Controller
					control={control}
					name="description"
					render={({ field }) => (
						<MarkdownField content={field.value as string} setValue={field.onChange} />
					)}
				></Controller>
			</Form.MarkdownWithPreviewContainer>
		</section>
	);
}
