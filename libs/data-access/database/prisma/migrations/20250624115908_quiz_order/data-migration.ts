import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { z } from "zod";

const prisma = new PrismaClient();

// 2 Data Migrations for Quizzes of Lessons:
//   1. Add "questionOrder" to Quizzes that do not have it defined.
//   2. Add "categoryOrder" to "arrange" Quizzes that do not have it defined.

const newQuizSchema = z.object({
	questions: z.array(
		z.object({
			questionId: z.string(),
			type: z.string()
		})
	),
	questionOrder: z.array(z.string()),
	config: z.any().nullable()
});

const newLessonSchema = z.object({
	slug: z.string(),
	quiz: newQuizSchema.nullable()
});

const oldLessonSchema = newLessonSchema.extend({
	quiz: newQuizSchema
		.extend({
			questionOrder: z.undefined()
		})
		.nullable()
});

const oldLessonSchemaWithDefinedQuiz = oldLessonSchema.extend({
	quiz: newQuizSchema.extend({
		questionOrder: z.undefined()
	})
});

const oldArrangeSchema = z.object({
	questionId: z.string(),
	type: z.literal("arrange"),
	statement: z.string(),
	withCertainty: z.boolean(),
	hints: z.array(
		z.object({
			hintId: z.string(),
			content: z.string()
		})
	),
	items: z.record(
		z.array(
			z.object({
				id: z.string(),
				content: z.string()
			})
		)
	),
	randomizeItems: z.boolean().optional().default(false)
});

type OldLesson = z.infer<typeof oldLessonSchema>;
type OldLessonWQuiz = z.infer<typeof oldLessonSchemaWithDefinedQuiz>;

type OldArrange = z.infer<typeof oldArrangeSchema>;

function isOldLessonWithoutQuestionOrder(lesson: OldLesson): lesson is OldLessonWQuiz {
	return !!lesson.quiz && lesson.quiz.questionOrder === undefined;
}

function isOldArrange(quiz: any): quiz is OldArrange {
	if (oldArrangeSchema.safeParse(quiz).success) {
		return true;
	}
	return false;
}

async function migrateMissingQuestionOrder(
	tx: Omit<
		PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
		"$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
	>
) {
	const lessons = await tx.lesson.findMany({});

	const promises = lessons
		// Apply data migration only to lessons with quizzes
		.filter(lesson => !!lesson.quiz)
		.map(lesson => {
			const parsed = oldLessonSchema.safeParse(lesson);
			if (parsed.success) {
				return lesson as typeof lesson & OldLesson;
			} else {
				return null;
			}
		})
		.map(l => {
			if (!l) return Promise.resolve();

			const oldQuizData = l.quiz as any;
			if (isOldLessonWithoutQuestionOrder(l)) {
				const lessonParsed = l as OldLessonWQuiz;
				// Extract ordered array of quizzes
				const questionIds = lessonParsed.quiz.questions.map(q => q.questionId);
				const questionOrder = questionIds;

				return tx.lesson.update({
					where: { slug: l.slug },
					data: {
						quiz: {
							...oldQuizData,
							questionOrder: questionOrder
						}
					}
				});
			} else {
				return Promise.resolve();
			}
		});

	await Promise.all(promises);
}

async function migrateMissingCategoryOrder(
	tx: Omit<
		PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
		"$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
	>
) {
	const lessons = await tx.lesson.findMany({});

	const promises = lessons
		// Apply data migration only to lessons with quizzes
		.filter(lesson => !!lesson.quiz)
		.map(lesson => {
			const parsed = oldLessonSchema.safeParse(lesson);
			if (parsed.success) {
				return lesson as typeof lesson & OldLesson;
			} else {
				return null;
			}
		})
		.map(l => {
			if (!l || !l.quiz?.questions.some(q => q.type === "arrange")) return Promise.resolve();

			const oldQuizData = l.quiz as any;

			const migratedQuestions = l.quiz?.questions.map(q => {
				if (!isOldArrange(q)) return q;
				return {
					...q,
					categoryOrder: Object.keys(q.items)
				};
			});
			const newQuizData = { ...oldQuizData, questions: migratedQuestions };

			return tx.lesson.update({
				where: { slug: l.slug },
				data: {
					quiz: newQuizData
				}
			});
		});

	await Promise.all(promises);
}

async function main() {
	try {
		await prisma.$transaction(async tx => {
			await migrateMissingQuestionOrder(tx);
			await migrateMissingCategoryOrder(tx);
		});
	} finally {
		await prisma.$disconnect();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
