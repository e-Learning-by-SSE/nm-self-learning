import { apiFetch } from "@self-learning/api";
import { database } from "@self-learning/database";
import { CourseEditor, CourseFormModel } from "@self-learning/teaching";
import { CourseContent } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { getRandomId } from "@self-learning/util/common";
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

	const lessonIds = (course?.content as CourseContent).flatMap(chapter => chapter.lessonIds);

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
		content: (course.content as CourseContent).map(chapter => ({
			chapterId: getRandomId(),
			title: chapter.title,
			description: chapter.description,
			lessons: chapter.lessonIds.map(
				id =>
					lessonsById.get(id) ?? {
						title: "Removed",
						lessonId: `removed-${id}`,
						slug: `removed-${id}`
					}
			)
		}))
	};

	return {
		notFound: !course,
		props: { course: courseFormModel, lessons }
	};
};

async function updateCourse(course: CourseFormModel): Promise<{ title: string; slug: string }> {
	return apiFetch<{ title: string; slug: string }, CourseFormModel>(
		"POST",
		`/api/teachers/courses/edit/${course.courseId}`,
		course
	);
}

export default function EditCoursePage({
	course
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const router = useRouter();

	function onConfirm(course: CourseFormModel) {
		async function create() {
			try {
				const { title } = await updateCourse(course);
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
