import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import {
	CourseEditor,
	CourseFormModel,
	mapCourseContentToFormContent
} from "@self-learning/teaching";
import { CourseContent, extractLessonIds } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

type EditCourseProps = {
	course: CourseFormModel;
	lessons: { title: string; lessonId: string; slug: string }[];
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

	const content = course.content as CourseContent;

	const lessonIds = extractLessonIds(content);

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
		content: mapCourseContentToFormContent(content, lessonsById)
	};

	return {
		notFound: !course,
		props: { course: courseFormModel, lessons }
	};
};

export default function EditCoursePage({ course, lessons }: EditCourseProps) {
	const { mutateAsync: updateCourse } = trpc.course.edit.useMutation();
	const router = useRouter();

	function onConfirm(updatedCourse: CourseFormModel) {
		async function update() {
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
		update();
	}

	return <CourseEditor course={course} onConfirm={onConfirm} />;
}
