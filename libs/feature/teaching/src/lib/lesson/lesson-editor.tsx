import { zodResolver } from "@hookform/resolvers/zod";
import { createEmptyLesson, lessonSchema } from "@self-learning/types";
import { DialogActions, OnDialogCloseFn, showToast, Tab, Tabs } from "@self-learning/ui/common";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { LessonContentEditor } from "./forms/lesson-content";
import { LessonInfoEditor } from "./forms/lesson-info";
import { QuizEditor } from "./forms/quiz-editor";
import { LessonFormModel } from "./lesson-form-model";
import { useRequiredSession } from "@self-learning/ui/layouts";

export async function onLessonCreatorSubmit(
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
			showToast({ type: "success", title: "Lernheit erstellt", subtitle: result.title });
		}
		onClose();
		return result;
	} catch (error) {
		console.error(error);
		showToast({
			type: "error",
			title: "Fehler",
			subtitle: "Lerneinheit konnte nicht erstellt werden."
		});

		return null;
	}
}

export async function onLessonEditorSubmit(
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
				title: "Lerneinheit gespeichert!",
				subtitle: result.title
			});
		}
		onClose();
	} catch (error) {
		showToast({
			type: "error",
			title: "Fehler",
			subtitle: "Die Lernheit konnte nicht gespeichert werden."
		});
	}
}

export function LessonEditor({
	onSubmit,
	initialLesson,
	isFullScreen
}: {
	onSubmit: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
	isFullScreen: boolean;
}) {
	const session = useRequiredSession();
	const [selectedTab, setSelectedTab] = useState(0);
	const form = useForm<LessonFormModel>({
		context: undefined,
		defaultValues: initialLesson ?? {
			...createEmptyLesson(),
			// Add current user as author
			authors: session.data?.user.isAuthor ? [{ username: session.data.user.name }] : []
		},
		resolver: zodResolver(lessonSchema)
	});

	return (
		<FormProvider {...form}>
			<form
				id="lessonform"
				onSubmit={form.handleSubmit(onSubmit, console.log)}
				className="flex h-full flex-col overflow-hidden"
			>
				<div className="flex h-full overflow-y-auto overflow-x-hidden">
					<div className="grid h-full gap-8 xl:grid-cols-[500px_1fr]">
						<LessonInfoEditor lesson={initialLesson} />

						<div>
							<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
								<Tab>Lerninhalt</Tab>
								<Tab>Lernkontrolle</Tab>
							</Tabs>
							{selectedTab === 0 && <LessonContentEditor />}
							{selectedTab === 1 && <QuizEditor />}
						</div>
					</div>
				</div>

				<div
					className={`${
						isFullScreen ? "fixed" : ""
					} pointer-events-none bottom-0 flex w-full items-end justify-end`}
				>
					<div className={`${isFullScreen ? "absolute" : "fixed"}  z-50 pr-5 pb-5`}>
						<DialogActions onClose={onSubmit}>
							<button type="submit" className="btn-primary pointer-events-auto">
								Speichern
							</button>
						</DialogActions>
					</div>
				</div>
			</form>
		</FormProvider>
	);
}
