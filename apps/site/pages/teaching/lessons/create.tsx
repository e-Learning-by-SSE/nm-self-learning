import { LessonType } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import { LessonEditor, LessonFormModel } from "@self-learning/teaching";
import { showToast } from "@self-learning/ui/common";
import { Unauthorized, useRequiredSession } from "@self-learning/ui/layouts";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

export default function CreateLessonPage() {
	const { mutateAsync: createLesson } = trpc.lesson.create.useMutation();
	const session = useRequiredSession();
	const authorUsername = session.data?.user.name;
	const router = useRouter();
	const { t } = useTranslation();

	async function onConfirm(lesson: LessonFormModel) {
		//don't save lesson without content
		if (lesson.content.length === 0) {
			showToast({
				type: "error",
				title: t("error"),
				subtitle: t("create_unit_error")
			});
			return;
		}
		try {
			const result = await createLesson(lesson);
			console.log(result);
			showToast({
				type: "success",
				title: t("create_unit_success"),
				subtitle: result.title
			});
			router.push(`/teaching/lessons/edit/${result.lessonId}`);
		} catch (error) {
			showToast({
				type: "error",
				title: t("error"),
				subtitle: t("create_unit_error_2")
			});
		}
	}

	if (!authorUsername) {
		return <Unauthorized>{t("unit_unauthorized")}</Unauthorized>;
	}
	return (
		<LessonEditor
			onConfirm={onConfirm}
			lesson={{
				lessonId: "",
				slug: "",
				title: "",
				subtitle: "",
				description: "",
				imgUrl: "",
				licenseId: null,
				quiz: { questions: [], config: null },
				content: [],
				authors: [{ username: authorUsername ?? "" }],
				lessonType: LessonType.TRADITIONAL,
				selfRegulatedQuestion: null
			}}
		/>
	);
}
