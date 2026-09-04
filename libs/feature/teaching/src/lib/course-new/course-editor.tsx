"use client";
import { FieldErrors, FormProvider, useForm, useFormState, useWatch } from "react-hook-form";
import { CourseFormModel, courseFormSchema } from "../course/course-form-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { DialogActions, showToast, Tab, Tabs } from "@self-learning/ui/common";
import { OpenAsJsonButton } from "@self-learning/ui/forms";
import { CourseType } from "@prisma/client";
import { CourseContentForm } from "../course/course-content-editor/course-content-form";
import { CourseInfoForm } from "../course/course-info-form";
import { SkillsEditor } from "../skills/skills-editor";
import { useRouter } from "next/router";
import { collectErrorMessages } from "../lesson/lesson-editor";
import { DynCourseContentForm } from "./dyn-course-content-form";
import { CoursePreview } from "./course-preview";

export function CourseEditor1({
	course,
	onSubmit
}: {
	course: CourseFormModel; // courseId "" when new
	onSubmit: (course: CourseFormModel) => Promise<{
		courseId: string;
		slug: string;
		title: string;
	}>;
}) {
	const router = useRouter();
	const form = useForm({ defaultValues: course, resolver: zodResolver(courseFormSchema) });
	const courseId = useWatch({ control: form.control, name: "courseId" });
	const type = useWatch({ control: form.control, name: "type" });
	const title = useWatch({ control: form.control, name: "title" });
	const { isDirty } = useFormState({ control: form.control });
	const [tab, setTab] = useState(0);
	const isPersisted = Boolean(courseId);
	const isStatic = type === CourseType.STATIC;

	async function handleSave(data: CourseFormModel) {
		const saved = await onSubmit(data);
		form.reset({ ...data, courseId: saved.courseId, slug: saved.slug });
	}

	function onClose() {
		if (isDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) {
			return;
		}
		router.back();
	}

	async function onTabChange(index: number) {
		// autosave on tab change
		if (isPersisted && isDirty) {
			await form.handleSubmit(handleSave, showCourseValidationErrors)();
		}
		setTab(index);
	}

	return (
		<FormProvider {...form}>
			<form
				id="courseform"
				onSubmit={e => {
					// lesson editor submit also triggers this
					if ((e.target as HTMLFormElement).id !== "courseform") return;
					form.handleSubmit(handleSave, showCourseValidationErrors)(e);
				}}
				className="w-full"
			>
				{/** TODO duplicated from lesson editor */}
				<div className="flex flex-col px-4 max-w-screen-xl mx-auto">
					<div className="flex justify-between mb-8">
						<div className="flex flex-col gap-2">
							<span className="font-semibold text-2xl text-c-primary">
								{isPersisted ? "Kurs bearbeiten" : "Kurs erstellen"}
							</span>
							<h1 className="text-4xl">{title}</h1>
						</div>
						<div className="pointer-events-auto">
							<DialogActions abortLabel="Schließen" onClose={onClose}>
								<OpenAsJsonButton form={form} validationSchema={courseFormSchema} />
								<button type="submit" className="btn-primary pointer-events-auto">
									{isPersisted ? "Speichern" : "Erstellen"}
								</button>
							</DialogActions>
						</div>
					</div>
					<Tabs selectedIndex={tab} onChange={onTabChange}>
						<Tab>Grunddaten</Tab>
						<Tab disabled={!isPersisted}>Skills</Tab>
						<Tab disabled={!isPersisted}>Inhalt</Tab>
						{!isStatic && <Tab disabled={!isPersisted}>Vorschau</Tab>}
					</Tabs>
					{tab === 0 && <CourseInfoForm isNew={!isPersisted} />}
					{isPersisted && (
						<>
							{/* TODO do I need courseId here? */}
							{tab === 1 && (
								<SkillsEditor target="course" courseId={courseId as string} />
							)}
							{tab === 2 &&
								(isStatic ? <CourseContentForm /> : <DynCourseContentForm />)}
							{tab === 3 && !isStatic && <CoursePreview />}
						</>
					)}
				</div>
			</form>
		</FormProvider>
	);
}

function showCourseValidationErrors(errors: FieldErrors) {
	const errorMsg = collectErrorMessages(errors)
		.map(item => {
			switch (item.field) {
				case "title":
					return "🞄 Kein Titel vergeben.";
				case "slug":
					return "🞄 Keine gültige URL-ID (Slug, mind. 3 Zeichen).";
				case "subtitle":
					return "🞄 Kein Untertitel vergeben.";
				case "permissions":
					return "🞄 Mindestens eine Gruppe mit Rechten wählen.";
				default:
					return `🞄 ${item.field}: ${item.message}`;
			}
		})
		.join("\n");
	showToast({
		type: "error",
		title: "Validierungsfehler",
		subtitle: errorMsg || "Bitte Pflichtfelder prüfen."
	});
}
