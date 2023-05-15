import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient, LessonType } from "@prisma/client";
import { QuestionType, QuizContent } from "@self-learning/question-types";
import { Quiz } from "@self-learning/quiz";
import {
	createCourseContent,
	createCourseMeta,
	createLessonMeta,
	extractLessonIds,
	LessonContent,
	LessonContentType
} from "@self-learning/types";
import { readFileSync } from "fs";
import { join } from "path";
import slugify from "slugify";

const prisma = new PrismaClient();

export function createLesson(
	title: string,
	subtitle: string | null,
	description: string | null,
	content: LessonContent,
	questions: QuizContent,
	licenseId?: number,
	lessonType: LessonType | null = null,
	selfRegulatedQuestion: string | null = ""
) {
	const lesson: Prisma.LessonCreateManyInput = {
		title,
		lessonId: faker.datatype.uuid(),
		slug: slugify(faker.random.alphaNumeric(8) + title, { lower: true, strict: true }),
		subtitle: subtitle,
		description: description,
		content: content,
		lessonType: lessonType ?? LessonType.TRADITIONAL,
		selfRegulatedQuestion: selfRegulatedQuestion, 
		quiz: {
			questions,
			config: null
		} satisfies Quiz,
		meta: {},
		licenseId: licenseId ?? 100
	};

	lesson.meta = createLessonMeta(lesson as any) as unknown as Prisma.JsonObject;

	return lesson;
}

type Lessons = {
	title: string;
	description: string;
	content: Prisma.LessonCreateManyInput[];
}[];

export function createAuthor(
	userName: string,
	name: string,
	imgUrl: string,
	lessons: Lessons,
	courses: Course[]
): Prisma.UserCreateInput {
	const slug = slugify(name, { lower: true, strict: true });
	return {
		name: userName,
		displayName: name,
		accounts: {
			create: [
				{
					provider: "demo",
					providerAccountId: slug,
					type: "demo-account"
				}
			]
		},
		author: {
			create: {
				displayName: name,
				slug: slug,
				imgUrl: imgUrl,
				courses: {
					connect: courses.map(course => ({ courseId: course.data.courseId }))
				},
				lessons: {
					connect: extractLessonIds(lessons).map(lessonId => ({ lessonId }))
				},
				teams: {
					create: []
				}
			}
		}
	};
}

type Chapters = {
	title: string;
	description: string;
	content: Prisma.LessonCreateManyInput[];
	licenseId?: number;
}[];

export function createCourse(
	subjectId: string,
	specializationId: string,
	title: string,
	subtitle: string | null,
	description: string | null,
	imgUrl: string | null,
	chapters: Chapters
): Course {
	const course = {
		courseId: faker.random.alphaNumeric(8),
		title: title,
		slug: slugify(title, { lower: true, strict: true }),
		subtitle: subtitle ?? "",
		description: description,
		imgUrl: imgUrl,
		subjectId: subjectId,
		createdAt: faker.date.past(),
		updatedAt: new Date(),
		content: createCourseContent(
			chapters.map(chapter => ({
				title: chapter.title,
				description: chapter.description,
				content: chapter.content.map(lesson => ({ lessonId: lesson.lessonId }))
			}))
		),
		meta: {}
	};

	course.meta = createCourseMeta(course);

	const result = {
		data: course as Prisma.CourseCreateManyInput,
		specializationId: specializationId
	};

	return result;
}

type answer = {
	content: string;
	isCorrect: boolean;
};

export function createMultipleChoice(
	question: string,
	answers: answer[],
	hints?: string[]
): QuestionType {
	const hintsData =
		hints?.map(h => ({
			hintId: faker.random.alphaNumeric(8),
			content: h
		})) ?? [];

	return {
		type: "multiple-choice",
		questionId: faker.random.alphaNumeric(8),
		statement: question,
		withCertainty: false,
		answers: answers.map(answer => ({
			answerId: faker.random.alphaNumeric(8),
			...answer
		})),
		hints: hintsData
	};
}

export function createTextQuestion(
	question: string,
	answers: string[],
	hints?: string[]
): QuestionType {
	const hintsData =
		hints?.map(h => ({
			hintId: faker.random.alphaNumeric(8),
			content: h
		})) ?? [];

	return {
		type: "exact",
		questionId: faker.random.alphaNumeric(8),
		statement: question,
		withCertainty: false,
		caseSensitive: false,
		acceptedAnswers: answers.map(answer => ({
			acceptedAnswerId: faker.random.alphaNumeric(8),
			value: answer
		})),
		hints: hintsData
	};
}

export function createVideo(url: string, duration: number): LessonContentType {
	return {
		type: "video",
		value: {
			url: url
		},
		meta: {
			duration: duration
		}
	};
}

export function createArticle(mdContent: string, estimatedDuration = 300): LessonContentType {
	return {
		type: "article",
		value: {
			content: mdContent
		},
		meta: {
			estimatedDuration: estimatedDuration
		}
	};
}

export function createPdf(url: string, estimatedDuration: number): LessonContentType {
	return {
		type: "pdf",
		value: {
			url: url
		},
		meta: {
			estimatedDuration: estimatedDuration
		}
	};
}

export function createSpecialization(
	subjectId: string,
	specializationId: string,
	title: string,
	subtitle: string,
	imgUrlBanner: string | null,
	cardImgUrl: string | null
): Prisma.SpecializationCreateManyInput {
	return {
		specializationId: specializationId,
		subjectId: subjectId,
		slug: slugify(title, {
			lower: true,
			strict: true
		}),
		title: title,
		subtitle: subtitle,
		cardImgUrl: cardImgUrl,
		imgUrlBanner: imgUrlBanner
	};
}

export function read(file: string) {
	return readFileSync(join(__dirname, file), "utf-8");
}

type Course = {
	data: Prisma.CourseCreateManyInput;
	specializationId: string;
};

export async function seedCaseStudy(
	name: string,
	courses: Course[],
	chapters: Chapters,
	authors: Prisma.UserCreateInput[] | null
): Promise<void> {
	console.log("\x1b[94m%s\x1b[0m", name + " Example:");

	const courseData: Prisma.CourseCreateManyInput[] = courses.map(c => c.data);
	await prisma.course.createMany({ data: courseData });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Courses");

	await prisma.lesson.createMany({
		data: chapters.flatMap(chapter =>
			chapter.content.map(lesson => ({
				...lesson,
				licenseId: lesson.licenseId ?? 1
			}))
		)
	});
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Lessons");

	const specializations = new Set(courses.map(c => c.specializationId));

	for (const id of specializations) {
		const coursesOfSpec = courses.filter(c => c.specializationId === id);

		console.log(
			`\u001B[35m - Connect specialization "${id}": [${courses
				.map(c => c.data.title)
				.join(", ")}]\x1b[0m`
		);

		await prisma.specialization.update({
			where: { specializationId: id },
			data: {
				courses: {
					connect: coursesOfSpec.map(c => ({ courseId: c.data.courseId }))
				}
			}
		});
	}
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Connect Specialization to Courses");

	if (authors) {
		for (const author of authors) {
			await prisma.user.create({ data: author });
		}
		console.log(" - %s\x1b[32m ✔\x1b[0m", "Authors");
	}

	console.log("\x1b[94m%s\x1b[32m ✔\x1b[0m", name + " Example");
}
