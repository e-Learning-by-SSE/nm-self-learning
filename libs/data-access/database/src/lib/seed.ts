import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";
import {
	createChapter,
	createCourseContent,
	createLesson,
	createLessonMeta,
	LessonContent
} from "@self-learning/types";
import { startOfDay, subHours } from "date-fns";
import { readFileSync } from "fs";
import { join } from "path";
import slugify from "slugify";

faker.seed(1);

const prisma = new PrismaClient();

const students = [
	{
		displayName: "Harry Potter",
		username: "potter"
	},
	{
		displayName: "Ronald Weasley",
		username: "weasley"
	}
];

const users: Prisma.UserCreateInput[] = students.map(student => ({
	name: student.username,
	accounts: {
		create: [
			{
				provider: "demo",
				providerAccountId: student.username,
				type: "demo-account"
			}
		]
	},
	student: {
		create: student
	}
}));

const learningDiaries: Prisma.LearningDiaryCreateManyInput[] = students.map(student => ({
	username: student.username,
	goals: "- Goal 1\n- Goal 2\n- Goal 3"
}));

const subjects: Prisma.SubjectCreateManyInput[] = [
	{
		subjectId: 1,
		slug: "informatik",
		title: "Informatik",
		subtitle: faker.lorem.sentences(2),
		cardImgUrl:
			"https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
		imgUrlBanner:
			"https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
	},
	{
		subjectId: 2,
		slug: "mathematik",
		title: "Mathematik",
		subtitle: faker.lorem.sentences(2),
		cardImgUrl:
			"https://images.unsplash.com/photo-1509869175650-a1d97972541a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
		imgUrlBanner:
			"https://images.unsplash.com/photo-1635372722656-389f87a941b7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2062&q=80"
	},
	{
		subjectId: 3,
		slug: "psychologie",
		title: "Psychologie",
		subtitle: faker.lorem.sentences(2),
		cardImgUrl:
			"https://c.pxhere.com/photos/90/ed/brain_mind_psychology_idea_hearts_love_drawing_split_personality-1370218.jpg!d",
		imgUrlBanner:
			"https://c.pxhere.com/photos/90/ed/brain_mind_psychology_idea_hearts_love_drawing_split_personality-1370218.jpg!d"
	}
];

const specializations: Prisma.SpecializationCreateManyInput[] = [
	{
		specializationId: 1,
		subjectId: 1,
		slug: "softwareentwicklung",
		title: "Softwareentwicklung",
		subtitle: faker.lorem.sentences(2),
		cardImgUrl:
			"https://images.unsplash.com/photo-1580920461931-fcb03a940df5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
		imgUrlBanner:
			"https://images.unsplash.com/photo-1580920461931-fcb03a940df5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
	}
];

const reactLessons: Prisma.LessonCreateManyInput[] = [
	"A Beginners Guide to React Introduction",
	"Create a User Interface with Vanilla JavaScript and DOM",
	"Create a User Interface with React’s createElement API",
	"Create a User Interface with React’s JSX syntax",
	"Use JSX effectively with React",
	"Render two elements side-by-side with React Fragments",
	"Create a Simple Reusable React Component",
	"Validate Custom React Component Props with PropTypes",
	"Understand and Use Interpolation in JSX",
	"Rerender a React Application",
	"Style React Components with className and inline Styles",
	"Use Event Handlers with React",
	"Manage state in a React Component with the useState hook",
	"Manage side-effects in a React Component with the useEffect hook",
	"Use a lazy initializer with useState",
	"Manage the useEffect dependency array",
	"Create reusable custom hooks",
	"Manipulate the DOM with React refs",
	"Understand the React Hook Flow",
	"Make Basic Forms with React",
	"Make Dynamic Forms with React",
	"Controlling Form Values with React",
	"Using React Error Boundaries to handle errors in React Components",
	"Use the key prop when Rendering a List with React",
	"Lifting and colocating React State",
	"Make HTTP Requests with React",
	"Handle HTTP Errors with React",
	"Install and use React DevTools",
	"Build and deploy a React Application with Codesandbox, GitHub, and Netlify",
	"A Beginners Guide to React Outro"
].map(title => {
	const lesson: Prisma.LessonCreateInput = {
		title,
		lessonId: faker.random.alphaNumeric(8),
		slug: slugify(title, { lower: true, strict: true }),
		subtitle: faker.lorem.paragraph(1),
		description: faker.lorem.paragraphs(3),
		imgUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=256",
		content: [
			{
				type: "video",
				value: {
					url: "https://www.youtube.com/watch?v=WV0UUcSPk-0"
				},
				meta: {
					duration: 300
				}
			}
		] as LessonContent,
		meta: {}
	};

	lesson.meta = createLessonMeta(lesson as any) as unknown as Prisma.JsonObject;

	return lesson;
});

const pythonLessons: Prisma.LessonCreateManyInput[] = [
	"What is Python?",
	"Hello World in Python"
].map(title => {
	const lesson: Prisma.LessonCreateManyInput = {
		title,
		lessonId: faker.random.alphaNumeric(8),
		slug: slugify(title, { lower: true, strict: true }),
		subtitle: faker.lorem.paragraph(1),
		description: faker.lorem.paragraphs(3),
		imgUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=256",
		content: [
			{
				type: "video",
				value: {
					url: "https://www.youtube.com/watch?v=WV0UUcSPk-0"
				},
				meta: {
					duration: 300
				}
			},
			{
				type: "article",
				value: {
					content: readFileSync(join(__dirname, "./markdown-example.mdx"), "utf8")
				},
				meta: {
					estimatedDuration: 300
				}
			}
		] as LessonContent,
		meta: {}
	};

	lesson.meta = createLessonMeta(lesson as any) as unknown as Prisma.JsonObject;

	return lesson;
});

const courses: Prisma.CourseCreateManyInput[] = [
	{
		courseId: faker.random.alphaNumeric(8),
		title: "The Beginner's Guide to React",
		slug: "the-beginners-guide-to-react",
		subtitle: faker.lorem.paragraph(2),
		description: faker.lorem.paragraphs(3),
		imgUrl: "https://images.unsplash.com/photo-1579403124614-197f69d8187b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1064&q=80",
		subjectId: 1,
		createdAt: new Date(2022, 4, 20),
		updatedAt: new Date(2022, 5, 1),
		content: createCourseContent([
			createLesson(reactLessons[0].lessonId),
			createChapter(
				"Learning React",
				[
					createChapter(
						"React Basics",
						new Array(13)
							.fill(0)
							.map((_, i) => createLesson(reactLessons[i + 1].lessonId)),
						faker.lorem.sentences(3)
					),
					createChapter(
						"Advanced React",
						[
							createChapter(
								"Part One",
								new Array(8)
									.fill(0)
									.map((_, i) => createLesson(reactLessons[i + 14].lessonId)),
								faker.lorem.sentences(3)
							),
							createChapter(
								"Part Two",
								new Array(7)
									.fill(0)
									.map((_, i) => createLesson(reactLessons[i + 22].lessonId)),
								faker.lorem.sentences(3)
							)
						],
						faker.lorem.paragraph(3)
					)
				],
				faker.lorem.paragraphs(2)
			),
			createLesson(reactLessons.at(-1)?.lessonId ?? "")
		])
	},
	{
		courseId: faker.random.alphaNumeric(8),
		title: "Python Tutorial",
		slug: "python-tutorial",
		subtitle: faker.lorem.paragraph(2),
		description: faker.lorem.paragraphs(3),
		imgUrl: "https://images.unsplash.com/photo-1613677135043-a2512fbf49fa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2172&q=80",
		subjectId: 1,
		createdAt: new Date(2022, 4, 20),
		updatedAt: new Date(2022, 5, 1),
		content: createCourseContent(pythonLessons.map(lesson => createLesson(lesson.lessonId)))
	}
];

const authors: Prisma.UserCreateInput[] = [
	{
		name: "Kent-C-Dodds",
		accounts: {
			create: [
				{
					provider: "demo",
					providerAccountId: "kent-c-dodds",
					type: "demo-account"
				}
			]
		},
		author: {
			create: {
				displayName: "Kent C Dodds",
				slug: "kent-c-dodds",
				imgUrl: "https://raw.githubusercontent.com/kentcdodds/kentcdodds.com/main/public/images/small-circular-kent.png",
				courses: {
					connect: {
						courseId: courses[0].courseId
					}
				},
				lessons: {
					connect: reactLessons.map(({ lessonId }) => ({ lessonId }))
				},
				teams: {
					create: []
				}
			}
		}
	}
];

const competences: Prisma.CompetenceCreateInput[] = [
	{ competenceId: "competence-1", title: "Competence #1" },
	{ competenceId: "competence-2", title: "Competence #2" },
	{ competenceId: "competence-3", title: "Competence #3" }
];

const enrollments: Prisma.EnrollmentCreateManyInput[] = [
	{
		status: "ACTIVE",
		createdAt: new Date(2022, 4, 20),
		courseId: courses[0].courseId,
		username: students[0].username
	}
];

const completedLessons: Prisma.CompletedLessonCreateManyInput[] = reactLessons
	.slice(0, 14)
	.map((lesson, index) => ({
		lessonId: lesson.lessonId,
		username: students[0].username,
		createdAt: subHours(Date.now(), index * 4)
	}));

async function seed(): Promise<void> {
	const start = Date.now();

	console.log("Deleting previous records...");
	await prisma.user.deleteMany();
	await prisma.team.deleteMany();
	await prisma.course.deleteMany();
	await prisma.specialization.deleteMany();
	await prisma.subject.deleteMany();
	await prisma.enrollment.deleteMany();
	await prisma.competence.deleteMany();
	await prisma.lesson.deleteMany();

	console.log("😅 Seeding...");
	await prisma.subject.createMany({ data: subjects });
	console.log("✅ Subjects");
	await prisma.specialization.createMany({ data: specializations });
	console.log("✅ Specialties");
	await prisma.course.createMany({ data: courses });
	console.log("✅ Courses");
	await prisma.lesson.createMany({ data: [...reactLessons, ...pythonLessons] });
	console.log("✅ Lessons");
	await createUsers();
	console.log("✅ Users");
	await prisma.enrollment.createMany({ data: enrollments });
	console.log("✅ Enrollments");
	await prisma.completedLesson.createMany({ data: completedLessons });
	console.log("✅ Completed Lessons");
	await prisma.competence.createMany({ data: competences });
	console.log("✅ Competences");
	await createAchievedCompetences();
	console.log("✅ AchievedCompetences");
	await prisma.learningDiary.createMany({ data: learningDiaries });
	console.log("✅ LearningDiaries");

	await prisma.specialization.update({
		where: { specializationId: 1 },
		data: {
			courses: {
				connect: [{ courseId: courses[0].courseId }, { courseId: courses[1].courseId }]
			}
		}
	});

	console.log("✅ Connect Specialization to Course");

	await prisma.user.create({ data: authors[0] });
	console.log("✅ Authors");

	console.log(`\nSeed command took ${Date.now() - start}ms`);
}

seed()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

async function createUsers(): Promise<void> {
	for (const user of users) {
		await prisma.user.create({
			data: user
		});
	}
}

async function createAchievedCompetences(): Promise<void> {
	const achievedCompetences = [
		{
			username: users[0].student?.create?.username as string,
			competenceId: competences[0].competenceId
		},
		{
			username: students[0].username,
			competenceId: competences[1].competenceId
		}
	];

	const promises = achievedCompetences.map(({ competenceId, username }) =>
		prisma.achievedCompetence.create({
			data: {
				competenceId,
				username,
				lessonSlug: "a-beginners-guide-to-react-introduction",
				achievedAt: new Date(2022, 5, 20)
			}
		})
	);

	await Promise.all(promises);
}
