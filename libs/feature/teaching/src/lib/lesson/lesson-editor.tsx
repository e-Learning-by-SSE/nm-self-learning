"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEmptyLesson, lessonSchema } from "@self-learning/types";
import {
	Dialog,
	DialogActions,
	IconOnlyButton,
	OnDialogCloseFn,
	showToast,
	Tab,
	Tabs
} from "@self-learning/ui/common";
import { useState } from "react";
import { FormProvider, useForm, FieldErrors, useFormState, useWatch } from "react-hook-form";
import { LessonContentEditor } from "./forms/lesson-content";
import { LessonInfoEditor } from "./forms/lesson-info";
import { QuizEditor } from "./forms/quiz-editor";
import { LessonFormModel } from "./lesson-form-model";
import { OpenAsJsonButton } from "@self-learning/ui/forms";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { SkillsEditor } from "../skills/skills-editor";
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "next-i18next";

type TranslationFunction = ReturnType<typeof useTranslation>["t"];

export async function onLessonCreatorSubmit(
	t: TranslationFunction,
	onClose: () => void,
	createLessonAsync: (lesson: LessonFormModel) => Promise<{
		title: string;
		lessonId: string;
		slug: string;
	}>,
	lesson?: LessonFormModel
) {
	try {
		let result = null;
		if (lesson) {
			result = await createLessonAsync(lesson);
			showToast({
				type: "success",
				title: t("Lesson_Creation_Success_Title"),
				subtitle: result.title
			});
		}
		onClose();
		return result;
	} catch (error) {
		console.error(error);
		showToast({
			type: "error",
			title: t("common:Error"),
			subtitle: t("Lesson_Creation_Failed")
		});

		return null;
	}
}

export async function onLessonEditorSubmit(
	t: TranslationFunction,
	onClose: () => void,
	editLessonAsync: (lesson: {
		lesson: LessonFormModel;
		lessonId: string;
	}) => Promise<{ title: string }>,
	lesson?: LessonFormModel
) {
	try {
		if (lesson) {
			const result = await editLessonAsync({
				lesson: lesson,
				lessonId: lesson.lessonId as string
			});
			showToast({
				type: "success",
				title: t("Lesson_Saved_Successfully"),
				subtitle: result.title
			});
		}
		onClose();
	} catch (error) {
		showToast({
			type: "error",
			title: t("common:Error"),
			subtitle: t("Lesson_Save_Failed")
		});
		console.log(error);
	}
}

type ValidationError = {
	field: string;
	message: string;
	type?: string;
};

/**
 * Traverse the nested FieldErrors object from react-hook-form and collect all error messages into a flat array.
 *
 * @param errors
 * @returns
 */

export function collectErrorMessages(errors: FieldErrors): ValidationError[] {
	const result: ValidationError[] = [];
	const visited = new WeakSet<object>();

	function traverse(obj: unknown, path: string[] = []) {
		if (!obj || typeof obj !== "object") return;

		if (visited.has(obj)) return;
		visited.add(obj);

		if ("message" in obj && typeof obj.message === "string") {
			result.push({
				field: path.join("."),
				message: obj.message,
				type: "type" in obj && typeof obj.type === "string" ? obj.type : undefined
			});

			return;
		}

		for (const [key, value] of Object.entries(obj)) {
			// Avoid endless loops on references and skip non-error properties
			if (key === "ref" || key === "type" || key === "message" || key === "types") {
				continue;
			}

			traverse(value, [...path, key]);
		}
	}

	traverse(errors);
	return result;
}

export function LessonEditor({
	onSubmit,
	onClose,
	initialLesson,
	inheritedPermissions,
	courseId,
	isFullScreen = true
}: {
	onSubmit: OnDialogCloseFn<LessonFormModel>;
	onClose: () => void;
	initialLesson?: LessonFormModel;
	inheritedPermissions?: LessonFormModel["permissions"];
	courseId?: string; // in context of which course lesson is edited
	isFullScreen?: boolean;
}) {
	const { t } = useTranslation("feature-teaching");
	const isNew = initialLesson === null || initialLesson === undefined;
	const session = useRequiredSession();
	const [selectedTab, setSelectedTab] = useState(0);
	const [expanded, setExpanded] = useState(false);
	const form = useForm<LessonFormModel>({
		context: undefined,
		defaultValues: initialLesson ?? {
			...createEmptyLesson(),
			permissions: (inheritedPermissions ?? []).map(p => ({ ...p })),
			// Add current user as author
			authors: session.data?.user.isAuthor ? [{ username: session.data.user.name }] : []
		},
		resolver: zodResolver(lessonSchema)
	});
	const { isDirty } = useFormState({ control: form.control });
	const title = useWatch({ control: form.control, name: "title" });

	function handleClose() {
		if (isDirty && !window.confirm(t("Lesson_Editor_Discard_Changes_Confirm"))) {
			return;
		}
		onClose();
	}

	function showValidationErrors(errors: FieldErrors) {
		const errorMsg = collectErrorMessages(errors)
			.map(error => {
				switch (error.field) {
					case "title":
						return t("Lesson_Validation_Title_Required");
					case "slug":
						return t("Lesson_Validation_Slug_Required");
					case "permissions":
						return t("Lesson_Validation_Permissions_Required");
					default:
						return t("Lesson_Validation_Field_Error", {
							field: error.field,
							message: error.message
						});
				}
			})
			.join("\n");

		showToast({
			type: "error",
			title: t("Lesson_Validation_Error_Title"),
			subtitle: t("Lesson_Validation_Error_Message", { errors: errorMsg })
		});
	}

	const body = (
		<form
			id="lessonform"
			onSubmit={form.handleSubmit(onSubmit, showValidationErrors)}
			className="w-full"
		>
			<div className="flex flex-col px-4 max-w-screen-xl mx-auto">
				<div className="flex justify-between mb-8">
					<div className="flex flex-col gap-2">
						<span className="font-semibold text-2xl text-c-primary">
							{t(initialLesson ? "Edit_Lesson" : "Create_Lesson")}
						</span>
						<h1 className="text-4xl">{title}</h1>
					</div>
					<div className="pointer-events-auto">
						<DialogActions onClose={handleClose}>
							<OpenAsJsonButton form={form} validationSchema={lessonSchema} />
							<button type="submit" className="btn-primary pointer-events-auto">
								{t(isNew ? "common:create" : "common:save")}
							</button>
						</DialogActions>
					</div>
				</div>
				<div>
					<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
						<Tab>{t("Lesson_Editor_Tab_Basic_Info")}</Tab>
						<Tab>{t("Skills_Title")}</Tab>
						<Tab>{t("Lesson_Editor_Tab_Content")}</Tab>
						<Tab>{t("Lesson_Editor_Tab_Quiz")}</Tab>
					</Tabs>
					{selectedTab === 0 && <LessonInfoEditor isNew={isNew} />}
					{selectedTab === 1 && (
						<SkillsEditor
							target="lesson"
							courseId={courseId}
							lessonId={initialLesson?.lessonId ?? undefined}
						/>
					)}
					{selectedTab === 2 && <LessonContentEditor />}
					{selectedTab === 3 && <QuizEditor />}
				</div>
			</div>
		</form>
	);
	// TODO maybe factor out this expandable dialog view
	return (
		<FormProvider {...form}>
			{isFullScreen ? (
				body
			) : (
				<Dialog
					onClose={handleClose}
					className={expanded ? "!rounded-none !p-4" : undefined}
					style={
						expanded
							? {
									height: "100vh",
									width: "100vw",
									maxWidth: "none",
									maxHeight: "none"
								}
							: { height: "80vh", width: "80vw" }
					}
				>
					<div className="absolute right-8 top-4 flex gap-4">
						<IconOnlyButton
							type="button"
							title={
								t(expanded ? "Lesson_Editor_Exit_Fullscreen" : "Lesson_Editor_Fullscreen")
							}
							icon={
								expanded ? (
									<ArrowsPointingInIcon className="h-5 w-5" />
								) : (
									<ArrowsPointingOutIcon className="h-5 w-5" />
								)
							}
							onClick={() => setExpanded(v => !v)}
						/>
					</div>
					<div className="overflow-y-auto mt-8">{body}</div>
				</Dialog>
			)}
		</FormProvider>
	);
}
