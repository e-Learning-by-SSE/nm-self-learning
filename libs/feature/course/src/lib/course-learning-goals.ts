import { CourseType } from "@self-learning/database";
import { database } from "@self-learning/database/server";
import { CourseContent, extractLessonIds } from "@self-learning/types";
import {
	collectSkillDescriptions,
	normalizeDescription,
	SkillGoalNode
} from "./collect-skill-descriptions";

// loads children only for skills without a description, one query per level
async function loadSkillGoalTree(rootIds: string[]): Promise<Map<string, SkillGoalNode>> {
	const skills = new Map<string, SkillGoalNode>();
	let frontier = Array.from(new Set(rootIds));

	while (frontier.length > 0) {
		const loaded = await database.skill.findMany({
			where: { id: { in: frontier } },
			select: {
				id: true,
				description: true,
				children: { select: { id: true }, orderBy: { name: "asc" } }
			}
		});

		const next = new Set<string>();
		for (const skill of loaded) {
			const childIds = skill.children.map(child => child.id);
			skills.set(skill.id, { id: skill.id, description: skill.description, childIds });

			if (!normalizeDescription(skill.description)) {
				childIds.filter(id => !skills.has(id)).forEach(id => next.add(id));
			}
		}

		frontier = Array.from(next).filter(id => !skills.has(id));
	}

	return skills;
}

async function getDynamicCourseLearningGoals(courseId: string): Promise<string[]> {
	const course = await database.course.findUnique({
		where: { courseId },
		select: { provides: { select: { id: true }, orderBy: { name: "asc" } } }
	});
	const rootIds = course?.provides.map(skill => skill.id) ?? [];
	if (rootIds.length === 0) return [];

	const skills = await loadSkillGoalTree(rootIds);
	return collectSkillDescriptions(rootIds, skills, true);
}

async function getStaticCourseLearningGoals(content: CourseContent): Promise<string[]> {
	const lessonIds = extractLessonIds(content);
	if (lessonIds.length === 0) return [];

	const lessons = await database.lesson.findMany({
		where: { lessonId: { in: lessonIds } },
		select: {
			lessonId: true,
			provides: { select: { id: true, description: true }, orderBy: { name: "asc" } }
		}
	});

	const lessonById = new Map(lessons.map(lesson => [lesson.lessonId, lesson]));
	const skills = new Map<string, SkillGoalNode>();
	const rootIds: string[] = [];

	for (const lessonId of lessonIds) {
		for (const skill of lessonById.get(lessonId)?.provides ?? []) {
			if (!skills.has(skill.id)) {
				skills.set(skill.id, {
					id: skill.id,
					description: skill.description,
					childIds: []
				});
				rootIds.push(skill.id);
			}
		}
	}

	return collectSkillDescriptions(rootIds, skills, false);
}

/**
 * Dynamic courses: descriptions of the course goals (falls back to child skills).
 * Static courses: distinct descriptions of the skills taught by the lessons.
 */
export async function getCourseLearningGoals(course: {
	courseId: string;
	type: CourseType;
	content: unknown;
}): Promise<string[]> {
	if (course.type === CourseType.DYNAMIC) {
		return getDynamicCourseLearningGoals(course.courseId);
	}
	return getStaticCourseLearningGoals((course.content ?? []) as CourseContent);
}
