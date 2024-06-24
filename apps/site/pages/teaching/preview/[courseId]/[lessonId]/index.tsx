import { LessonLayout, getCourseById } from "libs/feature/lesson/src/lib/lesson-layout";
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
		courseId: "placeholder",
		title: "Platzhalter-Kurs",
		slug: "placeholder"
	};
}

function getLesson(title: string | string[] | undefined, id: string | undefined) {
	const lessonId = id ? id : "";

	let lessonTitle = "Platzhalter-Lerneinheit";
	if (title) {
		if (typeof title === "string") {
			lessonTitle = title;
		} else {
			lessonTitle = title[0];
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
		lessonId: lessonId,
		subtitle: "",
		authors: [],
		selfRegulatedQuestion: "",
		license: { name: "", url: "", logoUrl: "", licenseText: "", oerCompatible: true }
	};
}

export default function LessonPreview() {
	const [lesson, setLesson] = useState(getLesson(undefined, ""));

	useEffect(() => {
		if (typeof window !== "undefined") {
			const storedData = localStorage.getItem("lessonInEditing");
			storedData ? setLesson(JSON.parse(storedData)) : setLesson(getLesson(undefined, ""));
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

function getValueFromQuery(value: string[] | string | undefined) {
	let result = "";

	if (typeof value === "string") {
		result = value;
	} else if (Array.isArray(value) && value.length > 0) {
		result = value[0];
	}
	return result;
}

export const getServerSideProps: GetServerSideProps<LessonProps> = async ({ query }) => {
	console.log("# query", query);
	const lessonId = query.lessonId ? getValueFromQuery(query.lessonId) : "";
	const lessonTitle = query.lessonTitle ? getValueFromQuery(query.lessonTitle) : "";
	const courseId = query.courseId ? getValueFromQuery(query.courseId) : "placeholder";

	let course = await getCourseById(courseId);
	if (!course) {
		course = getPlaceholderCourse();
	}

	const props = { lesson: getLesson(lessonTitle, lessonId), course: course };

	return {
		props: {
			...props,
			markdown: getEmptyMarkdown()
		}
	};
};

LessonPreview.getLayout = LessonLayout;
