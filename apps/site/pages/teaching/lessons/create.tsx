import { canCreate } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { LessonEditor, LessonFormModel, onLessonCreatorSubmit } from "@self-learning/teaching";
import { LoadingBox } from "@self-learning/ui/common";
import { Unauthorized, useCanCreate, useRequiredSession } from "@self-learning/ui/layouts";
import { withAuth } from "@self-learning/util/auth";
import { useRouter } from "next/router";
import { withTranslations } from "@self-learning/api";

export default function CreateLessonPage() {
	const session = useRequiredSession();
	const canCreateResource = useCanCreate();
	const router = useRouter();
	const { mutateAsync: createLessonAsync } = trpc.lesson.create.useMutation();

	if (session.status === "loading") {
		return <LoadingBox />;
	}

	if (!canCreateResource) {
		return (
			<Unauthorized>
				Um eine Lerneinheit zu erstellen, musst du Mitglied einer Gruppe sein.
			</Unauthorized>
		);
	}

	async function handleCreateClose(lesson?: LessonFormModel) {
		await onLessonCreatorSubmit(
			() => {
				router.push("/dashboard/author");
			},
			createLessonAsync,
			lesson
		);
	}

	return <LessonEditor onSubmit={handleCreateClose} isFullScreen={true} />;
}

export const getServerSideProps = withTranslations(
	["common", "feature-question-types"],
	withAuth(async (_ctx, user) => {
		if (!(await canCreate(user))) {
			return { redirect: { destination: "/403", permanent: false } };
		}
		return { props: {} };
	})
);
