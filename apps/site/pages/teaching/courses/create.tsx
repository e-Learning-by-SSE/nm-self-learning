import { trpc } from "@self-learning/api-client";
import { CourseEditor, CourseFormModel } from "@self-learning/teaching";
import { showToast } from "@self-learning/ui/common";
import { Unauthorized } from "@self-learning/ui/layouts";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function CreateCoursePage() {
	const { mutateAsync: createCourse } = trpc.course.create.useMutation();
	const router = useRouter();
	const session = useSession({ required: true });
	const author = session.data?.user.author;

	async function onConfirm(course: CourseFormModel) {
		try {
			const { title, slug } = await createCourse(course);
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
		<CourseEditor
			onConfirm={onConfirm}
			course={{
				courseId: "",
				title: "",
				slug: "",
				description: "",
				subtitle: "",
				imgUrl: "",
				subjectId: null,
				content: [],
				authors: [{ slug: author.slug }]
			}}
		/>
	);
}
