import { CourseType, Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { workerServiceClient, subscribeToJobEvents, ReturnTypeOf } from "@self-learning/worker-api";
import { CourseContent, courseContentSchema, extractLessonIds } from "@self-learning/types";

function parseCourseContent(raw: Prisma.JsonValue): CourseContent {
	const result = courseContentSchema.safeParse(raw);

	return result.success ? result.data : [];
}

/**
 * Gathers required and provided skill ids of the course and its lessons (from default content)
 * @param courseId - id of course to get context for
 * @returns object with course requires and provides, as well as its lessons with requires and provides
 */
async function getSkillContext(courseId: string) {
	const course = await database.course.findUnique({
		where: { courseId },
		select: {
			type: true,
			courseId: true,
			content: true,
			requires: { select: { id: true } },
			provides: { select: { id: true } }
		}
	});
	if (!course) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: `Course not found for id: ${courseId}`
		});
	}

	const lessonIds = extractLessonIds(parseCourseContent(course.content));
	const lessons = lessonIds.length
		? await database.lesson.findMany({
				where: { lessonId: { in: lessonIds } },
				select: {
					lessonId: true,
					requires: { select: { id: true } },
					provides: { select: { id: true } }
				}
			})
		: [];

	const flattenSkillId = (skill: { id: string }) => skill.id;

	return {
		type: course.type,
		courseId: course.courseId,
		requires: course.requires.map(flattenSkillId),
		provides: course.provides.map(flattenSkillId),
		lessons: lessons.map(lesson => ({
			lessonId: lesson.lessonId,
			requires: lesson.requires.map(flattenSkillId),
			provides: lesson.provides.map(flattenSkillId)
		}))
	};
}

type CourseQuery = {
	courseId: string;
	provides: {
		id: string;
	}[];
	requires: {
		id: string;
	}[];
};

export async function enqueueCoursePath({
	course,
	onFinish,
	userId
}: {
	course: CourseQuery;
	onFinish: (result: ReturnTypeOf<"pathGeneration">) => void;
	userId?: string;
}) {
	const [skills, lessons] = await Promise.all([
		database.skill.findMany({
			select: {
				id: true,
				children: { select: { id: true } }
			}
		}),
		database.lesson.findMany({
			select: {
				lessonId: true,
				requires: { select: { id: true } },
				provides: { select: { id: true } }
			}
		})
	]);

	const dbSkills = skills.map(s => ({
		id: s.id,
		children:
			s.children?.map(c => {
				return { id: c.id };
			}) ?? [],
		repositoryId: ""
	}));

	/**
	 * Consider knowledge, in the following order:
	 * 1. User's personal knowledge (if a user is specified)
	 * 2. Specified prerequisites of the course (in case of a course preview)
	 * 3. None
	 */
	let knowledge: string[] | undefined;
	if (userId) {
		const userKnowledge = await database.student.findUnique({
			where: { userId },
			select: { received: { select: { id: true } } }
		});
		knowledge = userKnowledge?.received.map(r => r.id) ?? [];
	} else if (course.requires) {
		knowledge = course.requires.map(r => r.id);
	}

	const jobId = randomUUID();
	subscribeToJobEvents({
		jobId,
		jobType: "pathGeneration",
		onFinish: async result => {
			onFinish(result);
		}
	});
	// Do not wait for results (must be handled via subscription)
	workerServiceClient.submitJob.mutate({
		jobId,
		jobType: "pathGeneration",
		payload: {
			dbSkills,
			lessons: lessons,
			goal: dbSkills.filter(skill =>
				course.provides.some(provide => provide.id === skill.id)
			),
			knowledge
		}
	});

	return jobId;
}

export async function enqueueCourseGraphJob({
	courseId,
	onFinish
}: {
	courseId: string;
	onFinish: (result: ReturnTypeOf<"courseGraphAnalysis">) => void;
}): Promise<string> {
	// get relevant skills for this course (default lesson path)
	const ctx = await getSkillContext(courseId);
	if (ctx.type !== CourseType.DYNAMIC) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Requested course is not dynamic"
		});
	}

	const ctxSkills = new Set([
		...ctx.requires,
		...ctx.provides,
		...ctx.lessons.flatMap(l => [...l.requires, ...l.provides])
	]);
	if (ctxSkills.size === 0) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Requested course does not have any skills required and provided"
		});
	}

	// TODO select all skill rows into memory might be expensive in the future
	const allSkills = await database.skill.findMany({
		select: { id: true, children: { select: { id: true } } }
	});
	// as skills form a tree, no way to know that a child can be learned by parent without loading all children skills (do DFS)
	const dfsQueue = [...ctxSkills];
	const skillMap = new Map(allSkills.map(s => [s.id, s]));
	while (dfsQueue.length > 0) {
		const skill = skillMap.get(dfsQueue.pop() as string); // can contain only string, length is checked
		for (const child of skill?.children ?? []) {
			if (!ctxSkills.has(child.id)) {
				ctxSkills.add(child.id);
				dfsQueue.push(child.id);
			}
		}
	}
	const relevantSkills = allSkills
		.filter(s => ctxSkills.has(s.id))
		.map(s => ({
			id: s.id,
			repositoryId: "",
			children: s.children
		}));

	// get relevant learning units (must have at least one skill from ctx)
	const skillIds = [...ctxSkills.keys()];
	// ctx lessons are ignored. If they are valid, they should reappear with this query
	const relevantLessons = await database.lesson.findMany({
		where: {
			OR: [
				{ requires: { some: { id: { in: skillIds } } } },
				{ provides: { some: { id: { in: skillIds } } } }
			]
		},
		select: {
			lessonId: true,
			requires: { select: { id: true } },
			provides: { select: { id: true } }
		}
	});

	const jobId = randomUUID();
	subscribeToJobEvents({
		jobId,
		jobType: "courseGraphAnalysis",
		attachResultToStatus: true,
		onFinish: async result => {
			onFinish(result);
		}
	});
	// Do not wait for results (must be handled via subscription)
	workerServiceClient.submitJob.mutate({
		jobId,
		jobType: "courseGraphAnalysis",
		payload: {
			dbSkills: relevantSkills,
			lessons: relevantLessons
		}
	});

	return jobId;
}
