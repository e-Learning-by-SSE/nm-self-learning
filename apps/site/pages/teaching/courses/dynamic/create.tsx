import { withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { DynCourseEditor, DynCourseFormModel } from "@self-learning/teaching";
import { showToast } from "@self-learning/ui/common";
import { Unauthorized, useRequiredSession } from "@self-learning/ui/layouts";
import { useRouter } from "next/router";

export default function CreateCoursePage() {
	const { mutateAsync: createCourse } = trpc.course.createDynamic.useMutation();
	const { mutateAsync: addCourse } = trpc.specialization.addCourse.useMutation();
	const router = useRouter();
	const { subjectId, specializationId } = router.query;
	const session = useRequiredSession();
	const author = session.data?.user.name;

	async function onConfirm(course: DynCourseFormModel) {
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

	if (!author) {
		return <Unauthorized>Um einen Kurs zu erstellen, musst du ein Autor sein.</Unauthorized>;
	}

	return (
		<>
			{router.isReady && ( // Query params are not available on first render -> Wait for router to be ready
				<DynCourseEditor
					onConfirm={onConfirm}
					course={{
						courseId: "",
						title: "",
						slug: "",
						description: "",
						subtitle: "",
						imgUrl: "",
						subjectId: null,
						authors: [{ username: author }],
						teachingGoals: []
					}}
				/>
			)}
		</>
	);
}

export const getServerSideProps = withTranslations(["common"]);
