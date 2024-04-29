import { QuizContent } from "@self-learning/question-types";
import { getRandomId } from "@self-learning/util/common";
import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";
import { createLessonWithRandomContentAndDemoQuestions, createUsers } from "../seed-functions";
import { createCourseContent, createCourseMeta, extractLessonIds } from "@self-learning/types";
import { subHours } from "date-fns";
import { defaultLicence } from "../license";

faker.seed(1);

const prisma = new PrismaClient();

const reactLessons = [
	{
		title: "Installation",
		description: faker.lorem.paragraphs(3),
		content: [
			createLessonWithRandomContentAndDemoQuestions("Start a New React Project"),
			createLessonWithRandomContentAndDemoQuestions("Add React to a Website"),
			createLessonWithRandomContentAndDemoQuestions("Editor Setup"),
			createLessonWithRandomContentAndDemoQuestions("React Developer Tools")
		]
	},
	{
		title: "Describing the UI",
		description: faker.lorem.paragraphs(3),
		content: [
			createLessonWithRandomContentAndDemoQuestions("Your First Component"),
			createLessonWithRandomContentAndDemoQuestions("Importing and Exporting Components"),
			createLessonWithRandomContentAndDemoQuestions("Writing Markup with JSX"),
			createLessonWithRandomContentAndDemoQuestions("JavaScript in JSX with Curly Braces"),
			createLessonWithRandomContentAndDemoQuestions("Passing Props to a Component"),
			createLessonWithRandomContentAndDemoQuestions("Conditional Rendering"),
			createLessonWithRandomContentAndDemoQuestions("Rendering Lists"),
			createLessonWithRandomContentAndDemoQuestions("Keeping Components Pure")
		]
	},
	{
		title: "Adding Interactivity",
		description: faker.lorem.paragraphs(3),
		content: [
			createLessonWithRandomContentAndDemoQuestions("Responding to Events"),
			createLessonWithRandomContentAndDemoQuestions("State: A Component's Memory"),
			createLessonWithRandomContentAndDemoQuestions("Render and Commit"),
			createLessonWithRandomContentAndDemoQuestions("State as a Snapshot"),
			createLessonWithRandomContentAndDemoQuestions("Queueing a Series of State Updates"),
			createLessonWithRandomContentAndDemoQuestions("Updating Objects in State"),
			createLessonWithRandomContentAndDemoQuestions("Updating Arrays in State")
		]
	},
	{
		title: "Managing State",
		description: faker.lorem.paragraphs(3),
		content: [
			createLessonWithRandomContentAndDemoQuestions("Reacting to Input with State"),
			createLessonWithRandomContentAndDemoQuestions("Choosing the State Structure"),
			createLessonWithRandomContentAndDemoQuestions("Sharing State Between Components"),
			createLessonWithRandomContentAndDemoQuestions("Preserving and Resetting State"),
			createLessonWithRandomContentAndDemoQuestions("Extracting State Logic into a Reducer"),
			createLessonWithRandomContentAndDemoQuestions("Passing Data Deeply with Context"),
			createLessonWithRandomContentAndDemoQuestions("Scaling Up with Reducer and Context")
		]
	},
	{
		title: "Escape Hatches",
		description: faker.lorem.paragraphs(3),
		content: [
			createLessonWithRandomContentAndDemoQuestions("Escape Hatches"),
			createLessonWithRandomContentAndDemoQuestions("Referencing Values with Refs"),
			createLessonWithRandomContentAndDemoQuestions("Manipulating the DOM with Refs"),
			createLessonWithRandomContentAndDemoQuestions("Synchronizing with Effects"),
			createLessonWithRandomContentAndDemoQuestions("You Might Not Need an Effect"),
			createLessonWithRandomContentAndDemoQuestions("Lifecycle of Reactive Effects"),
			createLessonWithRandomContentAndDemoQuestions("Separating Events from Effects"),
			createLessonWithRandomContentAndDemoQuestions("Removing Effect Dependencies"),
			createLessonWithRandomContentAndDemoQuestions("Reusing Logic with Custom Hooks")
		]
	}
];

export const reactCourses: Prisma.CourseCreateManyInput[] = [
	{
		courseId: faker.random.alphaNumeric(8),
		title: "The Beginner's Guide to React",
		slug: "the-beginners-guide-to-react",
		subtitle: faker.lorem.paragraph(2),
		description: faker.lorem.paragraphs(3),
		imgUrl: "https://images.unsplash.com/photo-1579403124614-197f69d8187b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1064&q=80",
		subjectId: "informatik",
		createdAt: new Date(2022, 4, 20),
		updatedAt: new Date(2022, 5, 1),
		content: createCourseContent(
			reactLessons.map(chapter => ({
				title: chapter.title,
				description: chapter.description,
				content: chapter.content.map(lesson => ({ lessonId: lesson.lessonId }))
			}))
		),
		meta: {}
	}
].map(course => ({
	...course,
	meta: createCourseMeta(course)
}));

const reactAuthors: Prisma.UserCreateInput[] = [
	{
		name: "kent-c-dodds",
		displayName: "Kent C. Dodds",
		accounts: {
			create: [
				{
					provider: "demo",
					providerAccountId: "kent-c-dodds",
					type: "demo-account"
				}
			]
		},
		student: {
			create: {
				username: "kent-c-dodds"
			}
		},
		author: {
			create: {
				displayName: "Kent C Dodds",
				slug: "kent-c-dodds",
				imgUrl: "https://raw.githubusercontent.com/kentcdodds/kentcdodds.com/main/public/images/small-circular-kent.png",
				courses: {
					connect: {
						courseId: reactCourses[0].courseId
					}
				},
				lessons: {
					connect: extractLessonIds(reactLessons).map(lessonId => ({ lessonId }))
				},
				specializationAdmin: {
					create: {
						specializationId: "softwareentwicklung"
					}
				}
			}
		}
	},
	{
		name: "dumbledore",
		displayName: "Albus Dumbledore",
		role: "ADMIN",
		image: "https://i.imgur.com/UWMVO8m.jpeg",
		accounts: {
			create: [
				{
					provider: "demo",
					providerAccountId: "dumbledore",
					type: "demo-account"
				}
			]
		},
		student: {
			create: {
				username: "dumbledore"
			}
		},
		author: {
			create: {
				displayName: "Albus Dumbledore",
				slug: "albus-dumbledore",
				imgUrl: "https://i.imgur.com/UWMVO8m.jpeg",
				subjectAdmin: {
					create: {
						subjectId: "informatik"
					}
				}
			}
		}
	},
	{
		name: "mcgonagall",
		image: "https://i.pinimg.com/originals/ac/9f/c3/ac9fc3d306b9eb07b451933cc756f733.jpg",
		displayName: "Minerva McGonagall",
		accounts: {
			create: [
				{
					provider: "demo",
					providerAccountId: "mcgonagall",
					type: "demo-account"
				}
			]
		},
		student: {
			create: {
				username: "mcgonagall"
			}
		},
		author: {
			create: {
				displayName: "Minerva McGonagall",
				slug: "mcgonagall",
				imgUrl: "https://i.pinimg.com/originals/ac/9f/c3/ac9fc3d306b9eb07b451933cc756f733.jpg"
			}
		}
	}
];

export const reactDemoQuestions: QuizContent = [
	{
		type: "multiple-choice",
		questionId: "923d78a5-af38-4599-980a-2b4cb62e4014",
		statement: `# How was your day?
Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quasi molestias doloribus assumenda aspernatur in maxime numquam. Sint quas nobis voluptatum nemo consequatur aperiam ea sit eveniet, perferendis iure! Fugiat, optio!`.trim(),
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
		],
		questionStep: 1
	},
	{
		type: "exact",
		questionId: "edbcf6a7-f9e9-4efe-b7ed-2bd0096c4e1d",
		statement: "# Was ist 1 + 1 ?",
		withCertainty: true,
		caseSensitive: true,
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
	{
		type: "programming",
		hints: [
			{
				hintId: "asdrfewq",
				content: "```java\nSystem.out.println();```"
			},
			{
				content: "# Lorem ipsum dolor \n- Eins\n- Zwei",
				hintId: getRandomId()
			}
		],
		custom: {
			mode: "standalone",
			expectedOutput: "Hello World",
			solutionTemplate:
				'public class Solution {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}'
		},
		language: "java",
		statement:
			"# Hello World\n\nErstelle ein Programm, welches `Hello World` auf der Konsole ausgibt.",
		questionId: "b6169fcf-3380-4062-9ad5-0af8826f2dfe",
		withCertainty: false
	},
	{
		type: "programming",
		hints: [
			{
				hintId: "dskfjsdk",
				content:
					"```ts\n// Verwende eine for-Schleife, um über alle Zahlen der Liste zu iterieren.\nfor (let i = 0; i < numbers.length; i++) {\n\t// DEINE LÖSUNG HIER\n}\n```"
			},
			{
				content: "# Lorem ipsum dolor \n- Eins\n- Zwei",
				hintId: getRandomId()
			}
		],
		custom: {
			mode: "callable",
			mainFile:
				'import java.util.Arrays;\n\npublic class Main {\n\tpublic static void main(String[] args) {\n\t\tint[][] testCases = new int[][] {\n\t\t\tnew int[] { 1, 1 },\n\t\t\tnew int[] { 1, 2, 3, 4, 5 },\n\t\t\tnew int[] { 7 },\n\t\t\tnew int[] { }\n\t\t};\n\n\t\tfor (int[] testCase : testCases) {\n\t\t\tSystem.out.println("### TEST");\n\t\t\tSystem.out.println(Arrays.toString(testCase));\n\t\t\tSystem.out.println("### EXPECTED");\n\t\t\tSystem.out.println(sumExpected(testCase));\n\t\t\tSystem.out.println("### ACTUAL");\n\t\t\tSystem.out.println(new Solution().sum(testCase));\n\t\t}\n\t}\n\n\tprivate static int sumExpected(int[] numbers) {\n\tint sum = 0;\n\t\tfor (int number : numbers) {\n\t\t\tsum += number;\n\t\t}\n\t\treturn sum;\n\t}\n}\n',
			solutionTemplate:
				"public class Solution {\n\tpublic int sum(int[] numbers) {\n\t\tif (numbers.length == 0) {\n\t\t\treturn -1; // Produce failing test case\n\t\t}\n\n\tint sum = 0;\n\t\tfor (int number : numbers) {\n\t\t\tsum += number;\n\t\t}\n\t\treturn sum;\n\t}\n}"
		},
		language: "java",
		statement:
			"# Schleifen\n\nImplementiere einen Algorithmus, der als Eingabe eine Liste von Zahlen erhält und die Summe aller Zahlen in der Liste zurückgibt.\n\n**Beispiel:**\n\n**Eingabe**: `[1, 2, 3, 4, 5]`  \n**Ausgabe**: `15`\n",
		questionId: "dee8dfd5-ee07-4071-bf7b-33b4cb1fe623",
		withCertainty: false
	},
	{
		type: "programming",
		hints: [
			{
				content: "```java\nSystem.out.println();```",
				hintId: getRandomId()
			},
			{
				content: "# Lorem ipsum dolor \n- Eins\n- Zwei",
				hintId: getRandomId()
			}
		],
		custom: {
			mode: "standalone",
			expectedOutput: "Hello World",
			solutionTemplate: 'console.log("Hello world");'
		},
		language: "typescript",
		statement: "# Hello World in TypeScript\r\n\r\nKappa",
		questionId: "oo8macg7",
		withCertainty: false
	},
	{
		type: "programming",
		hints: [
			{
				content: "```java\nSystem.out.println();```",
				hintId: getRandomId()
			},
			{
				content: "# Lorem ipsum dolor \n- Eins\n- Zwei",
				hintId: getRandomId()
			}
		],
		custom: {
			mode: "callable",
			mainFile:
				'import { sum } from "./Solution";\r\n\r\nconst testCases = [\r\n\t[1, 1],\r\n\t[1, 2, 3, 4, 5],\r\n\t[7],\r\n\t[],\r\n];\r\n\r\nfunction sumExpected(numbers: number[]): number {\r\n\treturn numbers.reduce((a, b) => a + b, 0);\r\n}\r\n\r\nfor (const testCase of testCases) {\r\n\tconsole.log("### TEST ###");\r\n\tconsole.log(testCase);\r\n\r\n\tconsole.log("### EXPECTED ###");\r\n\tconsole.log(sumExpected(testCase));\r\n\r\n\tconsole.log("### ACTUAL ###")\r\n\tconsole.log(sum(testCase));\r\n}\r\n',
			solutionTemplate:
				"export function sum(numbers: number[]): number {\r\n\t// DEINE LÖSUNG\r\n\treturn 0;\r\n}"
		},
		language: "typescript",
		statement:
			"# Schleifen in TypeScript\r\n\r\nImplementiere einen Algorithmus, der als Eingabe eine Liste von Zahlen erhält und die Summe aller Zahlen in der Liste zurückgibt.\r\n\r\n**Beispiel:**\r\n\r\n**Eingabe**: `[1, 2, 3, 4, 5]`  \r\n**Ausgabe**: `15`",
		questionId: "v0qpvil4o",
		withCertainty: false
	}
];

const reactStudents = [
	{
		displayName: "Harry Potter",
		username: "potter",
		image: "https://cdn2.steamgriddb.com/file/sgdb-cdn/icon/b0b9da81cf357c8884a06de8ef72bea0/32/256x256.png"
	},
	{
		displayName: "Ronald Weasley",
		username: "weasley",
		image: "https://i.pinimg.com/474x/d7/80/52/d7805247faaf18ef746e6d2e7d7c646a.jpg"
	}
];

const enrollments: Prisma.EnrollmentCreateManyInput[] = [
	{
		status: "ACTIVE",
		createdAt: new Date(2022, 4, 20),
		courseId: reactCourses[0].courseId,
		username: reactStudents[0].username
	}
];

const learningDiaries: Prisma.LearningDiaryCreateManyInput[] = reactStudents.map(student => ({
	username: student.username,
	goals: "- Goal 1\n- Goal 2\n- Goal 3"
}));

const completedReactLessons: Prisma.CompletedLessonCreateManyInput[] = extractLessonIds(
	reactLessons
)
	.slice(0, 7)
	.map((lessonId, index) => ({
		lessonId: lessonId,
		courseId: reactCourses[0].courseId,
		username: reactStudents[0].username,
		createdAt: subHours(Date.now(), index * 4)
	}));

const users: Prisma.UserCreateInput[] = reactStudents.map(student => ({
	name: student.username,
	image: student.image,
	displayName: student.displayName,
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
		create: {
			username: student.username
		}
	}
}));

export async function seedReactDemo() {
	await prisma.course.createMany({ data: reactCourses });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Courses");

	await prisma.lesson.createMany({
		data: reactLessons.flatMap(chapter =>
			chapter.content.map(lesson => ({
				...lesson,
				licenseId: lesson.licenseId ?? defaultLicence.licenseId
			}))
		)
	});
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Lessons");

	await createUsers(users);
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Users");

	await prisma.enrollment.createMany({ data: enrollments });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Enrollments");

	await prisma.completedLesson.createMany({ data: completedReactLessons });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Completed Lessons");

	await prisma.learningDiary.createMany({ data: learningDiaries });
	console.log(" - %s\x1b[32m ✔\x1b[0m", "LearningDiaries");

	await prisma.specialization.update({
		where: { specializationId: "softwareentwicklung" },
		data: {
			courses: {
				connect: reactCourses.map(course => ({ courseId: course.courseId }))
			}
		}
	});
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Connect Specialization to Course");

	for (const author of reactAuthors) {
		await prisma.user.create({ data: author });
	}
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Authors");
}
