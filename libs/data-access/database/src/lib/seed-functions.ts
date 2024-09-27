/* eslint-disable quotes */
import { faker } from "@faker-js/faker";
import { LessonType, Prisma, PrismaClient } from "@prisma/client";
import { QuestionType, QuizContent } from "@self-learning/question-types";
import {
	createCourseContent,
	createCourseMeta,
	createLessonMeta,
	extractLessonIds,
	LessonContent /* eslint-disable quotes */,
	LessonContentType
} from "@self-learning/types";
import { readFileSync } from "fs";
import { join } from "path";
import { slugify } from "@self-learning/util/common";
import { defaultLicence } from "./license";

const prisma = new PrismaClient();

const adminName = "dumbledore";

export function createLessonWithRandomContentAndDemoQuestions({
	title,
	questions
}: {
	title: string;
	questions: QuizContent;
}) {
	const content = [
		{
			type: "video",
			value: {
				url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
			},
			meta: {
				duration: 300
			}
		},
		{
			type: "article",
			value: {
				content: read("./demo/markdown-example.mdx")
			},
			meta: {
				estimatedDuration: 300
			}
		}
	] as LessonContent;

	return createLesson({
		title,
		subtitle: faker.lorem.paragraph(1),
		description: faker.lorem.paragraphs(3),
		content,
		questions,
		licenseId: defaultLicence.licenseId
	});
}

export function createLesson({
	title,
	subtitle,
	description,
	content,
	questions,
	licenseId,
	lessonType,
	selfRegulatedQuestion
}: {
	title: string;
	subtitle: string | null;
	description: string | null;
	content: LessonContent;
	questions: QuizContent;
	licenseId?: number | null;
	lessonType?: LessonType;
	selfRegulatedQuestion?: string;
}) {
	const lesson: Prisma.LessonCreateManyInput = {
		title,
		lessonId: faker.string.uuid(),
		slug: slugify(faker.string.alphanumeric(8) + title, { lower: true, strict: true }),
		subtitle: subtitle,
		description: description,
		content: content,
		lessonType: lessonType ?? LessonType.TRADITIONAL,
		selfRegulatedQuestion: selfRegulatedQuestion,
		quiz: {
			questions,
			config: null
		},
		meta: {},
		licenseId: licenseId ?? 0
	};

	lesson.meta = createLessonMeta(lesson as any) as unknown as Prisma.JsonObject;

	return lesson;
}

type Lessons = {
	title: string;
	description: string;
	content: Prisma.LessonCreateManyInput[];
}[];

export function createAuthor({
	userName,
	name,
	imgUrl,
	lessons,
	courses
}: {
	userName: string;
	name: string;
	imgUrl: string;
	lessons: Lessons;
	courses: Course[];
}): Prisma.UserCreateInput {
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

export function createCourse({
	subjectId,
	specializationId,
	title,
	subtitle,
	description,
	imgUrl,
	chapters
}: {
	subjectId: string;
	specializationId: string;
	title: string;
	subtitle?: string;
	description?: string;
	imgUrl?: string;
	chapters: Chapters;
}): Course {
	const course = {
		courseId: faker.string.alphanumeric(8),
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

export function createMultipleChoice({
	question,
	answers,
	hints
}: {
	question: string;
	answers: {
		content: string;
		isCorrect: boolean;
	}[];
	hints?: string[];
}): QuestionType {
	const hintsData =
		hints?.map(h => ({
			hintId: faker.string.alphanumeric(8),
			content: h
		})) ?? [];

	return {
		type: "multiple-choice",
		questionId: faker.string.alphanumeric(8),
		statement: question,
		withCertainty: false,
		answers: answers.map(answer => ({
			answerId: faker.string.alphanumeric(8),
			...answer
		})),
		questionStep: 1,
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
			hintId: faker.string.alphanumeric(8),
			content: h
		})) ?? [];

	return {
		type: "exact",
		questionId: faker.string.alphanumeric(8),
		statement: question,
		withCertainty: false,
		caseSensitive: false,
		acceptedAnswers: answers.map(answer => ({
			acceptedAnswerId: faker.string.alphanumeric(8),
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

export function createArticle({
	mdContent,
	estimatedDuration = 300
}: {
	mdContent: string;
	estimatedDuration: number;
}): LessonContentType {
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

export function createPdf({
	url,
	estimatedDuration
}: {
	url: string;
	estimatedDuration: number;
}): LessonContentType {
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

export function createSpecialization({
	subjectId,
	specializationId,
	title,
	subtitle,
	imgUrlBanner,
	cardImgUrl
}: {
	subjectId: string;
	specializationId: string;
	title: string;
	subtitle: string;
	imgUrlBanner?: string;
	cardImgUrl?: string;
}): Prisma.SpecializationCreateManyInput {
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

	const license = await prisma.license.findFirst({
		where: {
			name: defaultLicence.name
		},
		select: {
			licenseId: true
		}
	});

	await prisma.lesson.createMany({
		data: chapters.flatMap(chapter =>
			chapter.content.map(lesson => ({
				...lesson,
				licenseId: license ? license.licenseId : 0
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

export async function createUsers(users: Prisma.UserCreateInput[]): Promise<void> {
	for (const user of users) {
		await prisma.user.create({
			data: user
		});
	}
}

export async function getAdminUser() {
	return await prisma.user.findFirst({
		where: { name: adminName }
	});
}

export type Skill = {
	id: string;
	name: string;
	description: string;
};

export async function createSkills(skills: Skill[], repositoryId: string) {
	await Promise.all(
		skills.map(async skill => {
			const input: Prisma.SkillUncheckedCreateInput = {
				repositoryId: repositoryId,
				...skill
			};

			await prisma.skill.create({
				data: input
			});
		})
	);
}

export type SkillGroup = {
	id: string;
	name: string;
	description: string;
	children: string[];
};

export async function createSkillGroups(skillGroups: SkillGroup[], repository: Repository) {
	// Need to preserve ordering and wait to be finished before creating the next one!
	for (const skill of skillGroups) {
		const nested = skill.children?.map(i => ({ id: i }));

		await prisma.skill.create({
			data: {
				id: skill.id,
				repositoryId: repository.id,
				name: skill.name,
				description: skill.description,
				children: {
					connect: nested
				}
			}
		});
	}
}

export type Repository = {
	id: string;
	name: string;
	description: string;
};

export async function createRepositories(repository: Repository) {
	const admin = await getAdminUser();
	await prisma.skillRepository.create({
		data: {
			id: repository.id,
			ownerName: admin?.name ?? "unknown",
			name: repository.name,
			description: repository.description
		}
	});
}

function getRandomNumber(min: number, max: number): number {
	if (min > max) {
		throw new Error('min should not be greater than max');
	}
	return faker.number.int({ min, max });
}

// Function to generate a random date between 50 days and 6 hours ago
export function getRandomCreatedAt(): Date {
	const currentTime = new Date().getTime();
	const minTime = currentTime - 50 * 24 * 60 * 60 * 1000; // 50 days ago
	const maxTime = currentTime - 6 * 60 * 60 * 1000; // 6 hours ago

	const randomTime = getRandomNumber(minTime, maxTime);
	return new Date(randomTime);
}

// Function to generate random time interval in milliseconds
export function getRandomTimeIntervalInMs(): number {
	const minTimeMs = 60 * 1000; // 1 minute in ms
	const maxTimeMs = 28 * 60 * 60 * 1000; // 28 hours in ms

	return getRandomNumber(minTimeMs, maxTimeMs);
}

export function getRandomElementFromArray<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error('Array cannot be empty');
  }

  const randomIndex = getRandomNumber(0, arr.length - 1);
  return arr[randomIndex];
}

export type LearningStrategyCategory = {
	strategieName: string;
	techniques: string[];
};

export async function createStrategiesAndTechniques(input: LearningStrategyCategory[]) {
	for (const category of input) {
		const strat = await prisma.learningStrategy.create({
			data: { name: category.strategieName }
		});

		for (const technique of category.techniques) {
			await prisma.learningTechnique.create({
				data: {
					name: technique,
					defaultTechnique: true,
					strategy: { connect: { id: strat.id } }
				}
			});
		}
	}
}
