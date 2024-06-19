import { LessonLayout } from "libs/feature/lesson/src/lib/lesson-layout";
import Lesson from "apps/site/pages/courses/[courseSlug]/[lessonSlug]";
import { LessonType } from "@prisma/client";
import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import React from "react";
import { CompiledMarkdown } from "../../../../../../../libs/util/markdown/src";
import { LessonLayoutProps } from "@self-learning/lesson";

function getEmptyMarkdown() {
	return {
		article: null,
		description: null,
		preQuestion: null,
		subtitle: null
	};
}

function getPlaceholderCourse() {
	return {
		courseId: "empty-course",
		title: "Platzhalter-Kurs",
		slug: "empty-course"
	};
}

function getLesson(data: string | string[] | undefined) {
	let lessonTitle = "Platzhalter-Lerneinheit";

	if (data) {
		if (typeof data === "string") {
			lessonTitle = data;
		} else {
			lessonTitle = data[0];
		}
	}

	return {
		lessonType: LessonType.TRADITIONAL,
		quiz: null,
		meta: { hasQuiz: false, mediaTypes: {} },
		content: [],
		title: lessonTitle,
		slug: "",
		description: "",
		lessonId: "",
		subtitle: "",
		authors: [],
		selfRegulatedQuestion: "",
		license: { name: "", url: "", logoUrl: "", licenseText: "", oerCompatible: true }
	};
}

export default function LessonPreview() {
	const [lesson, setLesson] = useState(getLesson(undefined));

	useEffect(() => {
		if (typeof window !== "undefined") {
			const storedData = localStorage.getItem("lessonInEditing");
			storedData ? setLesson(JSON.parse(storedData)) : setLesson(getLesson(undefined));
		}
	}, []);

	/* TODO "back" btn
	function redirectBackToEditor() {
		let originPathname = "/";

		if (Array.isArray(origin)) {
			originPathname = origin[0];
		}

		if (typeof origin === "string") {
			originPathname = origin;
		}

		router.push(originPathname);
	}
	*/

	return <Lesson lesson={lesson} course={getPlaceholderCourse()} markdown={getEmptyMarkdown()} />;
}

export type LessonProps = LessonLayoutProps & {
	markdown: {
		description: CompiledMarkdown | null;
		article: CompiledMarkdown | null;
		preQuestion: CompiledMarkdown | null;
		subtitle: CompiledMarkdown | null;
	};
};
export const getServerSideProps: GetServerSideProps<LessonProps> = async ({ params }) => {
	console.log("Lesson, params", params);

	const lessonSlug = params?.["lessonSlug"] as string;
	return {
		props: {
			...{ lesson: getLesson(lessonSlug), course: getPlaceholderCourse() },
			markdown: getEmptyMarkdown()
		}
	};
};

LessonPreview.getLayout = LessonLayout;
