import { authOptions } from "@self-learning/api";
import { database } from "@self-learning/database";
import { Quiz } from "@self-learning/quiz";
import { LessonFormModel } from "@self-learning/teaching";
import { createEmptyLesson, LessonContent, lessonSchema } from "@self-learning/types";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { DialogActions, OnDialogCloseFn, showToast, Tab, Tabs } from "@self-learning/ui/common";
import { useRouter } from "next/router";
import { trpc } from "@self-learning/api-client";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LessonInfoEditor } from "../../../../../../libs/feature/teaching/src/lib/lesson/forms/lesson-info";
import { LessonContentEditor } from "../../../../../../libs/feature/teaching/src/lib/lesson/forms/lesson-content";
import { QuizEditor } from "../../../../../../libs/feature/teaching/src/lib/lesson/forms/quiz-editor";

type EditLessonProps = {
	lesson: LessonFormModel;
};

export async function onLessonCreatorClosed(
	onClose: () => void,
	createLessonAsync: (lesson: LessonFormModel) => Promise<{
		title: string;
	}>,
	lesson?: LessonFormModel
) {
	try {
		if (lesson) {
			console.log("Creating lesson...", lesson);
			const result = await createLessonAsync(lesson);
			showToast({ type: "success", title: "Lernheit erstellt", subtitle: result.title });
		}
		onClose();
	} catch (error) {
		console.error(error);
		showToast({
			type: "error",
			title: "Fehler",
			subtitle: "Lerneinheit konnte nicht erstellt werden."
		});
	}
}

export async function onLessonEditorClosed(
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
	onClose,
	initialLesson
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	const session = useRequiredSession();
	const [selectedLessonType, setLessonType] = useState(initialLesson?.lessonType);
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
				onSubmit={form.handleSubmit(onClose, console.log)}
				className="flex h-full flex-col overflow-hidden"
			>
				<div className="flex h-full flex-col gap-4 overflow-hidden">
					<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
						<Tab>Lerneinheit</Tab>
						<Tab>Lernkontrolle</Tab>
					</Tabs>
					<div className="playlist-scroll flex h-full flex-col gap-4 overflow-auto">
						{selectedTab === 0 && (
							<div className="grid h-full gap-8 xl:grid-cols-[500px_1fr]">
								<LessonInfoEditor
									lesson={initialLesson}
									setLessonType={setLessonType}
								/>
								<LessonContentEditor />
							</div>
						)}
						{selectedTab === 1 && <QuizEditor />}
					</div>
				</div>

				<DialogActions onClose={onClose}>
					<button type="submit" className="btn-primary">
						Speichern
					</button>
				</DialogActions>
			</form>
		</FormProvider>
	);
}

export const getServerSideProps: GetServerSideProps<EditLessonProps> = async ctx => {
	const lessonId = ctx.params?.lessonId;

	if (typeof lessonId !== "string") {
		throw new Error("No [lessonId] provided.");
	}

	const lesson = await database.lesson.findUnique({
		where: { lessonId },
		select: {
			lessonId: true,
			slug: true,
			title: true,
			subtitle: true,
			description: true,
			content: true,
			quiz: true,
			imgUrl: true,
			licenseId: true,
			authors: true,
			lessonType: true,
			selfRegulatedQuestion: true
		}
	});

	if (!lesson) {
		return { notFound: true };
	}

	const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);

	if (!session) {
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};
	}

	if (
		session.user.role !== "ADMIN" &&
		(!session.user.isAuthor || !lesson.authors.some(a => a.username === session.user.name))
	) {
		return {
			redirect: {
				destination: "/403",
				permanent: false
			}
		};
	}

	const lessonForm: LessonFormModel = {
		lessonId: lesson.lessonId,
		slug: lesson.slug,
		title: lesson.title,
		subtitle: lesson.subtitle,
		description: lesson.description,
		imgUrl: lesson.imgUrl,
		authors: lesson.authors.map(a => ({ username: a.username })),
		licenseId: lesson.licenseId,
		// Need type casting because JsonArray from prisma causes error
		content: (lesson.content ?? []) as LessonContent,
		quiz: lesson.quiz as Quiz,
		lessonType: lesson.lessonType,
		selfRegulatedQuestion: lesson.selfRegulatedQuestion
	};

	return {
		props: { lesson: lessonForm }
	};
};

export default function EditLessonPage({ lesson }: EditLessonProps) {
	const { mutateAsync: editLessonAsync } = trpc.lesson.edit.useMutation();
	const router = useRouter();
	const handleEditClose: OnDialogCloseFn<LessonFormModel> = async updatedLesson => {
		await onLessonEditorClosed(
			() => {
				router.push("/overview");
			},
			editLessonAsync,
			updatedLesson
		);
	};

	return <LessonEditor initialLesson={lesson} onClose={handleEditClose} />;
}
