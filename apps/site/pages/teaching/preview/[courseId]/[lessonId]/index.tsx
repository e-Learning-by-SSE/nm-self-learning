import { LessonLayout, getCourseById } from "libs/feature/lesson/src/lib/lesson-layout";
import Lesson from "apps/site/pages/courses/[courseSlug]/[lessonSlug]";
import { LessonType } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { GetServerSideProps } from "next";
import React from "react";
import { LessonLayoutProps } from "@self-learning/lesson";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import { LessonContent, findContentType } from "@self-learning/types";

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

type MarkdownContent = {
	description: MDXRemoteSerializeResult | null;
	subtitle: MDXRemoteSerializeResult | null;
	article: MDXRemoteSerializeResult | null;
	preQuestion: MDXRemoteSerializeResult | null;
};

export default function LessonPreview() {
	const [lesson, setLesson] = useState(getLesson(undefined, ""));
	const [markdown, setMarkdown] = useState<MarkdownContent>(getEmptyMarkdown());

	console.log("Preview, lesson", lesson);
	const lessonRef = useRef(lesson); // store the previous lesson state

	useEffect(() => {
		const fetchLessonData = async () => {
			if (typeof window !== "undefined") {
				const storedData = localStorage.getItem("lessonInEditing");
				const lessonData = storedData ? JSON.parse(storedData) : getLesson(undefined, "");
				setLesson(lessonData);
			}
		};

		fetchLessonData();
	}, []);

	useEffect(() => {
		const compileMarkdownData = async () => {
			if (lesson === lessonRef.current) {
				return;
			}

			const mdDescription = lesson.description
				? await compileMarkdown(lesson.description)
				: null;

			const mdSubtitle = lesson.subtitle ? await compileMarkdown(lesson.subtitle) : null;

			const { content: article } = findContentType(
				"article",
				lesson.content as LessonContent
			);
			const mdArticle = article ? await compileMarkdown(article.value.content) : null;

			setMarkdown({
				description: mdDescription,
				subtitle: mdSubtitle,
				article: mdArticle,
				preQuestion: null
			});

			console.log("Preview, UE, markdown", {
				description: mdDescription,
				subtitle: mdSubtitle,
				article: mdArticle
			});

			lessonRef.current = lesson;
		};

		compileMarkdownData();
	}, [lesson]);

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

	return (
		<Lesson
			lesson={lesson}
			course={getPlaceholderCourse()}
			markdown={markdown}
			isPreview={true}
		/>
	);
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
