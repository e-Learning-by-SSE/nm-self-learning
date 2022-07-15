import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { CourseEditor, CourseFormModel } from "@self-learning/teaching";
import { CourseContent, extractLessonIds } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";

type EditCourseProps = {
	course: CourseFormModel;
};

export const getServerSideProps: GetServerSideProps<EditCourseProps> = async ({ params }) => {
	const courseId = params?.courseId as string;

	const course = await database.course.findUnique({
		where: { courseId },
		include: {
			subject: {
				select: {
					subjectId: true,
					title: true
				}
			}
		}
	});

	if (!course) {
		return {
			notFound: true
		};
	}

	const lessonIds = extractLessonIds(course.content as CourseContent);

	const lessons = await database.lesson.findMany({
		where: { lessonId: { in: lessonIds } },
		select: {
			title: true,
			slug: true,
			lessonId: true
		}
	});

	const lessonsById = new Map<string, typeof lessons[0]>();

	for (const lesson of lessons) {
		lessonsById.set(lesson.lessonId, lesson);
	}

	const courseFormModel: CourseFormModel = {
		title: course.title,
		courseId: course.courseId,
		description: course.description,
		subtitle: course.subtitle,
		imgUrl: course.imgUrl,
		slug: course.slug,
		subjectId: course.subject?.subjectId ?? null,
		content: [] // TODO
	};

	return {
		notFound: !course,
		props: { course: courseFormModel, lessons }
	};
};

export default function EditCoursePage({
	course
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { mutateAsync: updateCourse } = trpc.useMutation("courses.edit");
	const router = useRouter();

	function onConfirm(updatedCourse: CourseFormModel) {
		async function create() {
			try {
				const { title } = await updateCourse({
					courseId: course.courseId as string,
					course: updatedCourse
				});
				showToast({ type: "success", title: "Änderung gespeichert!", subtitle: title });
				router.replace(router.asPath);
			} catch (error) {
				showToast({
					type: "error",
					title: "Fehler",
					subtitle: JSON.stringify(error, null, 2)
				});
			}
		}
		create();
	}

	return <CourseEditor course={course} onConfirm={onConfirm} />;
}
