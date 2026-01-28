import { withTranslations } from "@self-learning/api";
import { database } from "@self-learning/database";
import { Quiz } from "@self-learning/quiz";
import { LessonEditor, LessonFormModel, onLessonEditorSubmit } from "@self-learning/teaching";
import { LessonContent } from "@self-learning/types";
import { OnDialogCloseFn } from "@self-learning/ui/common";
import { useRouter } from "next/router";
import { trpc } from "@self-learning/api-client";
import { ResourceGuard, testResourceGuard } from "@self-learning/ui/layouts";
import { AccessLevel } from "@prisma/client";
import { withAuth } from "@self-learning/util/auth";

type EditLessonProps = {
	lesson: LessonFormModel;
};

export const getServerSideProps = withTranslations(
	["common"],
	withAuth<EditLessonProps>(async (ctx, user) => {
		const lessonId = ctx.params?.lessonId;

		if (typeof lessonId !== "string") {
			throw new Error("No [lessonId] provided.");
		}

		const lesson = await database.lesson.findUnique({
			where: { lessonId },
			select: {
				lessonId: true,
				courseId: true,
				slug: true,
				title: true,
				subtitle: true,
				description: true,
				content: true,
				quiz: true,
				imgUrl: true,
				licenseId: true,
				requires: true,
				provides: true,
				authors: true,
				lessonType: true,
				selfRegulatedQuestion: true,
				permissions: {
					select: {
						accessLevel: true,
						group: {
							select: {
								id: true,
								name: true
							}
						}
					}
				}
			}
		});

		if (!lesson) {
			return { notFound: true };
		}

		const hasAccess = testResourceGuard(
			AccessLevel.EDIT,
			lesson.permissions.map(p => ({ accessLevel: p.accessLevel, groupId: p.group.id })),
			new Set(user.memberships)
		);
		if (!hasAccess) {
			return {
				redirect: {
					destination: "/403",
					permanent: false
				}
			};
		}

		const lessonForm: LessonFormModel = {
			courseId: lesson.courseId,
			lessonId: lesson.lessonId,
			slug: lesson.slug,
			title: lesson.title,
			subtitle: lesson.subtitle,
			description: lesson.description,
			imgUrl: lesson.imgUrl,
			authors: lesson.authors.map(a => ({ username: a.username })),
			licenseId: lesson.licenseId,
			requires: lesson.requires.map(r => ({
				...r,
				children: [],
				parents: []
			})),
			provides: lesson.provides.map(t => ({
				...t,
				children: [],
				parents: []
			})),
			// Need type casting because JsonArray from prisma causes error
			content: (lesson.content ?? []) as LessonContent,
			quiz: lesson.quiz as Quiz,
			lessonType: lesson.lessonType,
			selfRegulatedQuestion: lesson.selfRegulatedQuestion,
			permissions: lesson.permissions.map(p => ({
				accessLevel: p.accessLevel,
				groupId: p.group.id,
				groupName: p.group.name
			}))
		};

		return {
			props: {
				lesson: lessonForm
			}
		};
	})
);

export default function EditLessonPage({ lesson }: EditLessonProps) {
	const { mutateAsync: editLessonAsync } = trpc.lesson.edit.useMutation();
	const router = useRouter();
	const handleEditClose: OnDialogCloseFn<LessonFormModel> = async updatedLesson => {
		await onLessonEditorSubmit(
			() => {
				router.push("/dashboard/author");
			},
			editLessonAsync,
			updatedLesson
		);
	};

	return (
		<ResourceGuard
			mode="fallback"
			accessLevel={AccessLevel.EDIT}
			allowedGroups={lesson.permissions}
		>
			<LessonEditor initialLesson={lesson} onSubmit={handleEditClose} isFullScreen={true} />
		</ResourceGuard>
	);
}
