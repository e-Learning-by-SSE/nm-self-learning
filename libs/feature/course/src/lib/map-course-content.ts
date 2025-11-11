import { PlayIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { LessonType } from "@prisma/client";
import { useCourseCompletion } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { useEnrollmentMutations, useEnrollments } from "@self-learning/enrollment";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import {
	CourseContent,
	Defined,
	extractLessonIds,
	LessonInfo,
	Summary
} from "@self-learning/types";
import { AuthorsList, showToast, ButtonActions, OnDialogCloseFn } from "@self-learning/ui/common";
import * as ToC from "@self-learning/ui/course";
import { CenteredContainer, CenteredSection, useAuthentication } from "@self-learning/ui/layouts";
import { formatDateAgo, formatSeconds } from "@self-learning/util/common";
import { useCourseGenerationSSE } from "@self-learning/util/common";
import { MDXRemote } from "next-mdx-remote";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { withAuth, withTranslations } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { useRouter } from "next/router";
import { Dialog } from "@self-learning/ui/common";
import { CombinedCourseResult, getCombinedCourses } from "@self-learning/course";

export function mapToTocContent(
	content: CourseContent,
	lessonIdMap: Map<string, LessonInfo>
): ToC.Content {
	let lessonNr = 1;

	return content.map(chapter => ({
		title: chapter.title,
		description: chapter.description,
		content: chapter.content.map(({ lessonId }) => {
			const lesson: ToC.Content[0]["content"][0] = lessonIdMap.has(lessonId)
				? {
						...(lessonIdMap.get(lessonId) as LessonInfo),
						lessonNr: lessonNr++
					}
				: {
						lessonId: "removed",
						slug: "removed",
						meta: { hasQuiz: false, mediaTypes: {} },
						title: "Removed",
						lessonType: LessonType.TRADITIONAL,
						lessonNr: -1
					};

			return lesson;
		})
	}));
}

export async function mapCourseContent(content: CourseContent): Promise<ToC.Content> {
	const lessonIds = extractLessonIds(content);

	const lessons = await database.lesson.findMany({
		where: { lessonId: { in: lessonIds } },
		select: {
			lessonId: true,
			slug: true,
			title: true,
			meta: true
		}
	});

	const map = new Map<string, LessonInfo>();

	for (const lesson of lessons) {
		map.set(lesson.lessonId, lesson as LessonInfo);
	}

	return mapToTocContent(content, map);
}

export function createCourseSummary(content: ToC.Content): Summary {
	const chapters = content.length;
	let lessons = 0;
	let duration = 0;

	for (const chapter of content) {
		for (const lesson of chapter.content) {
			lessons++;
			duration +=
				lesson.meta?.mediaTypes.video?.duration ??
				lesson.meta?.mediaTypes.article?.estimatedDuration ??
				0;
		}
	}

	return { lessons, chapters, duration };
}
