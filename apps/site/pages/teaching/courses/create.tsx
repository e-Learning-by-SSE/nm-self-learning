import { canCreate } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { CourseEditor, CourseFormModel } from "@self-learning/teaching";
import { LoadingBox, showToast } from "@self-learning/ui/common";
import { Unauthorized, useCanCreate, useRequiredSession } from "@self-learning/ui/layouts";
import { withAuth } from "@self-learning/util/auth";
import { useRouter } from "next/router";
import { withTranslations } from "@self-learning/api";

export default function CreateCoursePage() {
	const { mutateAsync: createCourse } = trpc.course.create.useMutation();
	const { mutateAsync: addCourse } = trpc.specialization.addCourse.useMutation();
	const router = useRouter();
	const { subjectId, specializationId } = router.query;
	const session = useRequiredSession();
	const canCreateResource = useCanCreate();
	const author = session.data?.user.name;

	async function onConfirm(course: CourseFormModel) {
		try {
			const { title, slug, courseId } = await createCourse(course);

			if (subjectId && specializationId) {
				await addCourse({
					subjectId: subjectId as string,
					specializationId: specializationId as string,
					courseId: courseId
				});
			}
			showToast({ type: "success", title: "Kurs erstellt!", subtitle: title });
			router.push(`/courses/${slug}`);
		} catch (error) {
			console.error(error);
			showToast({
				type: "error",
				title: "Fehler",
				subtitle: JSON.stringify(error, null, 2)
			});
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
				<CourseEditor
					onConfirm={onConfirm}
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
						authors: author ? [{ username: author }] : []
					}}
				/>
			)}
		</>
	);
}

export const getServerSideProps = withTranslations(
	["pages-course-info", "common", "feature-question-types"],
	withAuth(async (_ctx, user) => {
		if (!(await canCreate(user))) {
			return { redirect: { destination: "/403", permanent: false } };
		}
		return { props: {} };
	})
);
