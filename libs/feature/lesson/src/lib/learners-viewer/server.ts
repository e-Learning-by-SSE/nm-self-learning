import { createLessonPropsFrom } from "./create-lesson-props";
import { Session } from "next-auth";
import { database } from "@self-learning/database/server";
import type { ParsedUrlQuery } from "querystring";
import { getLesson } from "../lesson-data-access";
import { StandaloneLessonLayoutProps } from "./standalone-lesson-layout";
import type { LessonCourseData, LessonData } from "../lesson-data-access";
import { getCourse } from "../lesson-data-access";

export type LessonLayoutProps = {
	lesson: LessonData;
	course: LessonCourseData;
};

export async function getSSpLessonCourseLayout(
	params?: ParsedUrlQuery | undefined
): Promise<LessonLayoutProps | { notFound: true }> {
	const standaloneProps = await getSspStandaloneLessonLayout(params);
	if ("notFound" in standaloneProps) {
		return { notFound: true };
	}

	const courseSlug = params?.["courseSlug"] as string;
	if (!courseSlug) {
		throw new Error("No course/lesson slug provided.");
	}

	const course = await getCourse(courseSlug);
	if (!course) {
		return { notFound: true };
	}

	return { ...standaloneProps, course };
}

export async function getSspStandaloneLessonLayout(
	params?: ParsedUrlQuery | undefined
): Promise<StandaloneLessonLayoutProps | { notFound: true }> {
	const lessonSlug = params?.["lessonSlug"] as string;
	if (!lessonSlug) {
		throw new Error("No lesson slug provided.");
	}

	const lesson = await getLesson(lessonSlug);

	if (!lesson) {
		return { notFound: true };
	}

	return { lesson };
}

export async function getSspLearnersView(
	parentProps: LessonLayoutProps | StandaloneLessonLayoutProps,
	user: Session["user"]
) {
	const { lesson } = parentProps;
	lesson.quiz = null;
	const lessonProps = await createLessonPropsFrom(lesson);

	const data = await database.completedLesson.findMany({
		where: {
			lessonId: lesson.lessonId,
			user: {
				username: user.name
			}
		},
		select: {
			performanceScore: true
		},
		orderBy: { performanceScore: "desc" },
		take: 1 // Take only the highest score
	});

	const lessonWithScore = { ...lesson, performanceScore: data[0]?.performanceScore ?? null };

	return {
		props: {
			...parentProps,
			lesson: lessonWithScore,
			// course: parentProps.course ?? undefined,
			markdown: {
				...lessonProps
			}
		}
	};
}
