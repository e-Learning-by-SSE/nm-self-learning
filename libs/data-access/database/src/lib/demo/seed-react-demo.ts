import { QuizContent } from "@self-learning/question-types";
import { getRandomId, slugify } from "@self-learning/util/common";
import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";
import { createLessonWithRandomContentAndDemoQuestions, createUsers } from "../seed-functions";
import { createCourseContent, createCourseMeta, extractLessonIds } from "@self-learning/types";
import { subHours } from "date-fns";
import { defaultLicenseId } from "../license";
import { createRepositories, createSkillGroups, createSkills } from "../seed-functions";

faker.seed(1);

const prisma = new PrismaClient();

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

const reactLessons = [
	createLessonWithRandomContentAndDemoQuestions({
		title: "Start a New React Project",
		questions: reactDemoQuestions,
		teachingGoals: ["101"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Add React to a Website",
		questions: reactDemoQuestions,
		teachingGoals: ["101"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Editor Setup",
		questions: reactDemoQuestions,
		teachingGoals: ["101"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "React Developer Tools",
		questions: reactDemoQuestions,
		teachingGoals: ["101"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Your First Component",
		questions: reactDemoQuestions,
		teachingGoals: ["103"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Importing and Exporting Components",
		questions: reactDemoQuestions,
		teachingGoals: ["211"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Writing Markup with JSX",
		questions: reactDemoQuestions,
		teachingGoals: ["101"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "JavaScript in JSX with Curly Braces",
		questions: reactDemoQuestions,
		teachingGoals: ["102"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Passing Props to a Component",
		questions: reactDemoQuestions,
		teachingGoals: ["104"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Conditional Rendering",
		questions: reactDemoQuestions,
		teachingGoals: ["107"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Rendering Lists",
		questions: reactDemoQuestions,
		teachingGoals: ["108"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Keeping Components Pure",
		questions: reactDemoQuestions,
		teachingGoals: ["103"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Responding to Events",
		questions: reactDemoQuestions,
		teachingGoals: ["106"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "State: A Component's Memory",
		questions: reactDemoQuestions,
		teachingGoals: ["105"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Render and Commit",
		questions: reactDemoQuestions,
		teachingGoals: ["210"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "State as a Snapshot",
		questions: reactDemoQuestions,
		teachingGoals: ["105"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Queueing a Series of State Updates",
		questions: reactDemoQuestions,
		teachingGoals: ["105"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Updating Objects in State",
		questions: reactDemoQuestions,
		teachingGoals: ["105"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Updating Arrays in State",
		questions: reactDemoQuestions,
		teachingGoals: ["105"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Reacting to Input with State",
		questions: reactDemoQuestions,
		teachingGoals: ["105"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Choosing the State Structure",
		questions: reactDemoQuestions,
		teachingGoals: ["105"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Sharing State Between Components",
		questions: reactDemoQuestions,
		teachingGoals: ["211"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Preserving and Resetting State",
		questions: reactDemoQuestions,
		teachingGoals: ["105"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Extracting State Logic into a Reducer",
		questions: reactDemoQuestions,
		teachingGoals: ["213"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Passing Data Deeply with Context",
		questions: reactDemoQuestions,
		teachingGoals: ["214"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Scaling Up with Reducer and Context",
		questions: reactDemoQuestions,
		teachingGoals: ["214"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Escape Hatches",
		questions: reactDemoQuestions,
		teachingGoals: ["213"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Referencing Values with Refs",
		questions: reactDemoQuestions,
		teachingGoals: ["213"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Manipulating the DOM with Refs",
		questions: reactDemoQuestions,
		teachingGoals: ["213"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Synchronizing with Effects",
		questions: reactDemoQuestions,
		teachingGoals: ["109"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "You Might Not Need an Effect",
		questions: reactDemoQuestions,
		teachingGoals: ["109"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Lifecycle of Reactive Effects",
		questions: reactDemoQuestions,
		teachingGoals: ["210"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Separating Events from Effects",
		questions: reactDemoQuestions,
		teachingGoals: ["109"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Removing Effect Dependencies",
		questions: reactDemoQuestions,
		teachingGoals: ["109"]
	}),
	createLessonWithRandomContentAndDemoQuestions({
		title: "Reusing Logic with Custom Hooks",
		questions: reactDemoQuestions,
		teachingGoals: ["213"]
	})
];

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
		enabledFeatureLearningDiary: false,
		enabledLearningStatistics: true,
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

const skills = [
	{ id: "101", name: "JSX Basics", description: "HTML-ähnliche Syntax in JavaScript" },
	{
		id: "102",
		name: "JSX Expressions",
		description: "Einbettung von JavaScript-Ausdrücken in JSX"
	},
	{ id: "103", name: "Component Basics", description: "Funktionale Komponenten schreiben" },
	{
		id: "104",
		name: "Component Props",
		description: "Props zum Parametrisieren von Komponenten verwenden"
	},
	{ id: "105", name: "Component State", description: "Lokalen Zustand mit useState verwalten" },
	{ id: "106", name: "Event Handling", description: "Events in React Komponenten behandeln" },
	{ id: "107", name: "Conditional Rendering", description: "Rendern basierend auf Bedingungen" },
	{ id: "108", name: "Lists & Keys", description: "Listen dynamisch rendern mit .map()" },
	{ id: "109", name: "useEffect Basics", description: "Side Effects mit useEffect" },
	{
		id: "210",
		name: "Component Lifecycle",
		description: "Den Lifecycle von Komponenten verstehen"
	},
	{
		id: "211",
		name: "Component Composition",
		description: "Komponenten kombinieren und verschachteln"
	},
	{ id: "212", name: "Forms", description: "Formularhandling in React" },
	{ id: "213", name: "Custom Hooks", description: "Eigene Hooks erstellen und verwenden" },
	{ id: "214", name: "Context API", description: "Globale Daten mit Context bereitstellen" },
	{ id: "215", name: "Routing Basics", description: "Navigation mit react-router" },
	{ id: "216", name: "Dynamic Routing", description: "Dynamische Routen & URL-Parameter" },
	{ id: "217", name: "Error Boundaries", description: "Fehlerbehandlung in React-Komponenten" },
	{ id: "218", name: "Code Splitting", description: "Lazy Loading von Komponenten" },
	{
		id: "219",
		name: "Styling Approaches",
		description: "CSS, CSS Modules, Styled Components, Tailwind"
	}
];

const skillGroups = [
	{
		id: "2001",
		name: "JSX & Rendering",
		description: "Basiswissen zum Schreiben von React Code mit JSX",
		children: ["101", "102", "107", "108"]
	},
	{
		id: "2002",
		name: "Component Fundamentals",
		description: "Alles rund um Komponenten",
		children: ["103", "104", "105", "106", "211"]
	},
	{
		id: "2003",
		name: "Hooks Basics",
		description: "Grundlagen zu React Hooks",
		children: ["105", "109", "210", "213"]
	},
	{
		id: "2004",
		name: "Advanced React Patterns",
		description: "Fortgeschrittene Techniken",
		children: ["212", "213", "214", "217"]
	},
	{
		id: "2005",
		name: "Routing & Navigation",
		description: "Navigationskonzepte in React",
		children: ["215", "216"]
	},
	{
		id: "2006",
		name: "Performance & UX",
		description: "Optimierung und Benutzererlebnis",
		children: ["218", "219"]
	},
	{
		id: "2007",
		name: "React Core Concepts",
		description: "Zusammenführung aller Kernkonzepte",
		children: ["2001", "2002", "2003", "2004", "2005", "2006"]
	}
];

const repository = {
	id: "2",
	name: "React Fundamentals Repository",
	description: "Skill Repository für grundlegende React Kenntnisse"
};

async function seedReactDemoSkills() {
	await createRepositories(repository);
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Repositories");

	await createSkills(skills, repository.id);
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Skills");

	await createSkillGroups(skillGroups, repository);
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Skill Groups");
}

export async function seedReactDemo() {
	await createUsers(users);
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Users");

	for (const author of reactAuthors) {
		await prisma.user.create({ data: author });
	}
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Authors");

	await seedReactDemoSkills();

	const course = await prisma.course.create({
		data: {
			courseId: faker.random.alphaNumeric(8),
			title: "The Beginner's Guide to React",
			slug: "the-beginners-guide-to-react",
			subtitle: faker.lorem.paragraph(2),
			description: faker.lorem.paragraphs(3),
			imgUrl: "https://images.unsplash.com/photo-1579403124614-197f69d8187b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1064&q=80",
			subjectId: "informatik",
			createdAt: new Date(2022, 4, 20),
			updatedAt: new Date(2022, 5, 1),
			teachingGoals: {
				connect: skillGroups.map(group => ({ id: group.id }))
			}
		}
	});

	console.log(" - %s\x1b[32m ✔\x1b[0m", "Courses");

	const licenseId = await defaultLicenseId();

	await Promise.all(
		reactLessons.map(async lesson => {
			try {
				await prisma.lesson.create({
					data: {
						...lesson,
						license: {
							connect: { licenseId }
						}
					}
				});
			} catch (error) {
				console.error("Error creating lesson:", error);
			}
		})
	);

	console.log(" - %s\x1b[32m ✔\x1b[0m", "Lessons");

	await prisma.specialization.update({
		where: { specializationId: "softwareentwicklung" },
		data: {
			courses: {
				connect: { courseId: course.courseId }
			}
		}
	});
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Connect Specialization to Course");
}
