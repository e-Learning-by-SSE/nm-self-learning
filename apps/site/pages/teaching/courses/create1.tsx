import { canCreate } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { CourseEditor1, CourseFormModel } from "@self-learning/teaching";
import { LoadingBox, showToast } from "@self-learning/ui/common";
import { Unauthorized, useCanCreate, useRequiredSession } from "@self-learning/ui/layouts";
import { withAuth } from "@self-learning/util/auth";
import { useRouter } from "next/router";
import { withTranslations } from "@self-learning/api";
import { CourseType } from "@prisma/client";

export type CourseSaveResult = {
	courseId: string;
	slug: string;
	title: string;
};

export default function CreateCoursePage() {
	const { mutateAsync: createCourse } = trpc.course.create.useMutation();
	const { mutateAsync: addCourse } = trpc.specialization.addCourse.useMutation();
	const router = useRouter();
	const { subjectId, specializationId } = router.query;
	const session = useRequiredSession();
	const canCreateResource = useCanCreate();
	const author = session.data?.user.name;

	async function onSubmit(course: CourseFormModel): Promise<CourseSaveResult> {
		try {
			const created = await createCourse(course);
			if (subjectId && specializationId) {
				await addCourse({
					subjectId: subjectId as string,
					specializationId: specializationId as string,
					courseId: created.courseId
				});
			}
			showToast({ type: "success", title: "Kurs erstellt!", subtitle: created.title });
			await router.replace(`/teaching/courses/edit1/${created.courseId}`);
			return created;
		} catch (error) {
			console.error(error);
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: JSON.stringify(error, null, 2)
			});
			throw error;
		}
	}

	if (session.status === "loading") {
		return <LoadingBox />;
	}

	if (!canCreateResource) {
		return (
			<Unauthorized>
				Um einen Kurs zu erstellen, musst du Mitglied einer Gruppe sein.
			</Unauthorized>
		);
	}

	return (
		<>
			{router.isReady && (
				<CourseEditor1
					onSubmit={onSubmit}
					course={{
						permissions: [],
						courseId: "",
						title: "",
						slug: "",
						description: "",
						subtitle: "",
						imgUrl: "",
						subjectId: null,
						content: [],
						authors: author ? [{ username: author }] : [],
						requires: [],
						provides: [],
						type: CourseType.STATIC,
						version: ""
					}}
				/>
			)}
		</>
	);
}

export const getServerSideProps = withTranslations(
	["pages-course-info", "common", "feature-question-types", "kee"],
	withAuth(async (_ctx, user) => {
		if (!(await canCreate(user))) {
			return { redirect: { destination: "/403", permanent: false } };
		}
		return { props: {} };
	})
);
