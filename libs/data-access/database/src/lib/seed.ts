import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";
import { QuizContent } from "@self-learning/question-types";
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

const questions: QuizContent = [
	{
		type: "multiple-choice",
		questionId: "923d78a5-af38-4599-980a-2b4cb62e4014",
		statement: `
		# How was your day?

		Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quasi molestias doloribus assumenda aspernatur in maxime numquam. Sint quas nobis voluptatum nemo consequatur aperiam ea sit eveniet, perferendis iure! Fugiat, optio!
		`.trim(),
		withCertainty: true,
		answers: [
			{
				answerId: "1fc74b31-7772-4ea8-b570-60b5c104f804",
				content: "Very Good",
				isCorrect: true
			},
			{
				answerId: "35d310ee-1acf-48e0-8f8c-090acd0e873a",
				content: "Good",
				isCorrect: true
			},
			{
				answerId: "cd33a2ef-95e8-4353-ad1d-de778d62ad57",
				content: "Bad",
				isCorrect: false
			},
			{
				answerId: "211b5171-d7b2-4fc9-98ab-88af35f53df2",
				content: "Very Bad",
				isCorrect: false
			}
		],
		hints: [
			{
				hintId: "abc",
				content:
					"Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero laudantium sequi illo, veritatis labore culpa, eligendi, quod consequatur autem ad dolorem explicabo quos alias harum fuga sapiente reiciendis. Incidunt, voluptates."
			},
			{
				hintId: "def",
				content: "# Lorem ipsum dolor \n- Eins\n- Zwei"
			}
		]
	},
	{
		type: "short-text",
		questionId: "edbcf6a7-f9e9-4efe-b7ed-2bd0096c4e1d",
		statement: "# Was ist 1 + 1 ?",
		withCertainty: true,
		acceptedAnswers: [
			{
				acceptedAnswerId: "724f781e-56b2-4057-831e-b1d6962c48b1",
				value: "2"
			}
		],
		hints: []
	},
	{
		type: "text",
		questionId: "34fca2c2-c547-4f66-9a4e-927770a55090",
		statement: "# Was ist 1 + 1 ?",
		withCertainty: true,
		hints: []
	},
	// {
	// 	type: "cloze",
	// 	questionId: "49497f71-8ed2-44a6-b36c-a44a4b0617d1",
	// 	statement: "# Lückentext",
	// 	withCertainty: false,
	// 	textArray: textArray,
	// 	hints: []
	// },
	{
		type: "vorwissen",
		questionId: "c9de042a-6962-4f21-bc57-bf58841be5f2",
		statement: `lorem ipsum dolor sit amet consectetur adipisicing elit. **Quasi** molestias doloribus assumenda aspernatur in maxime numquam. Sint quas nobis voluptatum nemo consequatur aperiam ea sit eveniet, perferendis iure ?
		![image](https://images.unsplash.com/photo-1523875194681-bedd468c58bf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1742&q=80)`,
		answers: [
			{
				answerId: "f797e6fc-8d03-41a2-9c93-9fcb3da0c147",
				content: "Statement 1",
				isCorrect: false
			},
			{
				answerId: "ef88d034-a0ea-4e85-bfc0-4381021f2449",
				content: "Statement 2",
				isCorrect: false
			},
			{
				answerId: "d0a1af94-92ea-4415-b1e3-cca7218b132a",
				content: "Statement 3",
				isCorrect: false
			},
			{
				answerId: "1220605d-e1b2-4933-bc7f-31b73c7a17bf",
				content: "Statement 4",
				isCorrect: false
			}
		],
		requireExplanationForAnswerIds: "ef88d034-a0ea-4e85-bfc0-4381021f2449",
		withCertainty: false,
		hints: []
	},
	{
		type: "programming",
		language: "java",
		withCertainty: false,
		questionId: "b6169fcf-3380-4062-9ad5-0af8826f2dfe",
		statement: `# Hello World
		
Erstelle ein Programm, welches \`Hello World\` auf der Konsole ausgibt.`,
		custom: {
			mode: "standalone",
			solutionTemplate: `public class HelloWorld {
	public static void main(String[] args) {
		System.out.println("Hello World");
	}
}`,
			expectedOutput: "Hello World"
		},
		hints: [
			{
				hintId: "asdrfewq",
				content: "```java\nSystem.out.println();```"
			}
		]
	},
	{
		type: "programming",
		language: "typescript",
		withCertainty: false,
		questionId: "dee8dfd5-ee07-4071-bf7b-33b4cb1fe623",
		statement: `# Schleifen
		
Implementiere einen Algorithmus, der als Eingabe eine Liste von Zahlen erhält und die Summe aller Zahlen in der Liste zurückgibt.

**Beispiel:**

**Eingabe**: \`[1, 2, 3, 4, 5]\`  
**Ausgabe**: \`15\`
`,
		custom: {
			mode: "callable",
			solutionTemplate:
				"export function sum(numbers: number[]): number {\n\t// DEINE LÖSUNG\n\treturn 0;\t\n}",
			mainFile: `import { sum } from "./Solution";

const testCases = [
[1, 1],
[1, 2, 3, 4, 5],
[7],
[],
];

function sumExpected(numbers: number[]): number {
return numbers.reduce((a, b) => a + b, 0);
}

for (const testCase of testCases) {
console.log(sum(testCase));
}

console.log("### EXPECTED ###")

for (const testCase of testCases) {
console.log(sumExpected(testCase));
}
`
		},
		hints: [
			{
				hintId: "dskfjsdk",
				content:
					"```ts\n// Verwende eine for-Schleife, um über alle Zahlen der Liste zu iterieren.\nfor (let i = 0; i < numbers.length; i++) {\n\t// DEINE LÖSUNG HIER\n}\n```"
			}
		]
	},
	{
		type: "programming",
		language: "java",
		withCertainty: false,
		questionId: "b5884b38-bed2-4f00-8c21-8a7b0737af2e",
		statement: `# Schleifen
		
Implementiere einen Algorithmus, der als Eingabe eine Liste von Zahlen erhält und die Summe aller Zahlen in der Liste zurückgibt.

**Beispiel:**

**Eingabe**: \`[1, 2, 3, 4, 5]\`  
**Ausgabe**: \`15\`
`,
		custom: {
			mode: "callable",
			solutionTemplate: `public class Solution {
public int sum(int[] numbers) {
	if (numbers.length == 0) {
		return -1; // Produce failing test case
	}

	int sum = 0;
	for (int number : numbers) {
		sum += number;
	}
	return sum;
}
}`,
			mainFile: `import java.util.Arrays;

public class Main {
public static void main(String[] args) {
	int[][] testCases = new int[][] {
		new int[] { 1, 1 },
		new int[] { 1, 2, 3, 4, 5 },
		new int[] { 7 },
		new int[] { }
	};

	for (int[] testCase : testCases) {
		System.out.println("### TEST");
		System.out.println(Arrays.toString(testCase));
		System.out.println("### EXPECTED");
		System.out.println(sumExpected(testCase));
		System.out.println("### ACTUAL");
		System.out.println(new Solution().sum(testCase));
	}
}

private static int sumExpected(int[] numbers) {
	int sum = 0;
	for (int number : numbers) {
		sum += number;
	}
	return sum;
}
}
`
		},
		hints: [
			{
				hintId: "dskfjsdk",
				content:
					"```ts\n// Verwende eine for-Schleife, um über alle Zahlen der Liste zu iterieren.\nfor (let i = 0; i < numbers.length; i++) {\n\t// DEINE LÖSUNG HIER\n}\n```"
			}
		]
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
		quiz: questions,
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
