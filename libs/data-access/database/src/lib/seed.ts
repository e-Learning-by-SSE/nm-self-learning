import { subHours } from 'date-fns';
import { readFileSync } from 'fs';
import { join } from 'path';
import slugify from 'slugify';

import { faker } from '@faker-js/faker';
import { Prisma, PrismaClient } from '@prisma/client';
import { QuizContent } from '@self-learning/question-types';
import {
    createCourseContent,
    createCourseMeta,
    createLessonMeta,
    extractLessonIds,
    LessonContent,
} from '@self-learning/types';

import { javaExample } from './java-example';
import { mathExample } from './math-example';
import { psychologyExample } from './psychology/psychology-example';
import { createSpecialization } from './seed-functions';

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
	},
	createSpecialization(
		3,
		2,
		"Wahrnehmung",
		"Man spricht von Wahrnehmung (*perception*), wenn man sich mit der Integration und Interpretation von Reizen aus der Umwelt und dem Körperinnern beschäftigt. ",
		"https://www.publicdomainpictures.net/pictures/280000/velka/optical-illusion-1542409604zVu.jpg",
		"https://www.publicdomainpictures.net/pictures/280000/velka/optical-illusion-1542409604zVu.jpg"
	),
	createSpecialization(
		3,
		3,
		"Aufmerksamkeit",
		"Man spricht von Aufmerksamkeit (*attention*), wenn man sich mit der Fähigkeit, bestimmte Informationen für eine genauere Analyse auszuwählen und andere zu ignorieren, beschäftigt.",
		"https://pixnio.com/free-images/2019/06/08/2019-06-08-09-44-18-1200x800.jpg",
		"https://pixnio.com/free-images/2019/06/08/2019-06-08-09-44-18-1200x800.jpg"
	),
	createSpecialization(
		3,
		4,
		"Bewusstsein",
		"Man spricht einerseits von Bewusstsein (*consciousness*), wenn das wache Wissen um das Erleben sowie das Aufmerken auf einzelne Erlebnisse und andererseits das wache Wissen um das kontrollierte und initiierte Handeln gemeint ist. Auch die Gesamtheit der unmittelbaren Erfahrung, die sich aus der Wahrnehmung von sich selbst und der Umgebung, den eigenen Kognitionen, Vorstellungen und Gefühlen zusammensetzt wird als Bewusstsein bezeichnet. ",
		"https://c.pxhere.com/photos/f5/82/head_psychology_thoughts_think_perception_face_woman_psyche-1192085.jpg!d",
		"https://c.pxhere.com/photos/f5/82/head_psychology_thoughts_think_perception_face_woman_psyche-1192085.jpg!d"
	),
	createSpecialization(
		3,
		5,
		"Lernen",
		"Man spricht von Lernen (*learning*), wenn es sich um eine relativ permanente Veränderung des Verhaltens als Folge von vorausgehender Erfahrung handelt.",
		"https://www.kikisweb.de/geschichten/maerchen/nuernb1.gif",
		"https://www.kikisweb.de/geschichten/maerchen/nuernb1.gif"
	),
	createSpecialization(
		3,
		6,
		"Gedächtnis und Wissen",
		"Man spricht von Gedächtnis (*memory*), wenn man sich über das dauerhafte Fortbestehen von aufgenommenen Informationen über die Zeit, die dann wieder abrufbar sind, Gedanken macht.",
		"https://static.spektrum.de/fm/912/f2000x857/Memory_pixabay48118_Nemo-CC0.png",
		"https://static.spektrum.de/fm/912/f2000x857/Memory_pixabay48118_Nemo-CC0.png"
	),
	createSpecialization(
		3,
		7,
		"Sprache",
		"Mit Sprache (*speech*) ist die Fähigkeit des Menschen gemeint, durch ein komplexes System von Symbolen und Regeln, miteinander zu kommunizieren.",
		"https://c.pxhere.com/images/5e/d6/a2ff24ae9521a8904c5fbab3fd89-1437965.jpg!d",
		"https://c.pxhere.com/images/5e/d6/a2ff24ae9521a8904c5fbab3fd89-1437965.jpg!d"
	),
	createSpecialization(
		3,
		8,
		"Motivation und Volition",
		"Man spricht von Motivation (*motivation*), wenn man die Gesamtheit der Beweggründe (Motive), die zur Handlungsbereitschaft führen, meint. Die Umsetzung von Motiven in Handlungen nennt man Volition (*volition*).",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Carrot_and_stick_motivation.svg/220px-Carrot_and_stick_motivation.svg.png",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Carrot_and_stick_motivation.svg/220px-Carrot_and_stick_motivation.svg.png"
	),
	createSpecialization(
		3,
		9,
		"Denken, Problemlösen, Entscheiden und Urteilen",
		"Man spricht von Denken (*thinking*), wenn die interpretierende und ordnungsstiftende Verarbeitung von Informationen gemeint ist. Beim Problemlösen (*problem solving*) geht es um das Auffinden eines vorher nicht bekannten Weges von einem gegebenen Anfangszustand zu einem gewünschten und mehr oder weniger genau bekannten Endzustand. Das Entscheiden (*decision making*) betrifft die menschlichen Prozesse beim Wählen zwischen Alternativen und beim Urteilen (*judgment*) geht es um das Schlussfolgern aufgrund von Erfahrung.",
		"https://images.pexels.com/photos/814133/pexels-photo-814133.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
		"https://images.pexels.com/photos/814133/pexels-photo-814133.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
	),
	createSpecialization(
		3,
		10,
		"Emotion",
		"Man spricht von Emotionen (*emotions*), wenn es sich um ein komplexes Muster von Veränderungen handelt. Dabei umfassen dieese physiologische Erregung, Gefühle, kognitive Prozesse (Bewertungen) und Verhaltensreaktionen auf eine Situation, die als persönlich bedeutsam wahrgenommen wurde.",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Carrot_and_stick_motivation.svg/220px-Carrot_and_stick_motivation.svg.png",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Carrot_and_stick_motivation.svg/220px-Carrot_and_stick_motivation.svg.png"
	),
	createSpecialization(
		3,
		11,
		"Handlung, Bewegung und Psychomotorik",
		"Man spricht von Handlungen (*action*), wenn es um motorische Aktivitäten geht, um einen angestrebten Zielzustand zu verwirklichen.",
		"https://www.spielundlern.de/wissen/wp-content/uploads/2017/04/kinder-bewegung-psychomotorik-768x235.png",
		"https://www.spielundlern.de/wissen/wp-content/uploads/2017/04/kinder-bewegung-psychomotorik-768x235.png"
	),
	createSpecialization(2, 12, "Didaktik der Mathematik", "", null, null),
	createSpecialization(2, 13, "Fachmathematik", "", null, null)
];

const questions: QuizContent = [
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
	// {
	// 	type: "vorwissen",
	// 	questionId: "c9de042a-6962-4f21-bc57-bf58841be5f2",
	// 	statement: `lorem ipsum dolor sit amet consectetur adipisicing elit. **Quasi** molestias doloribus assumenda aspernatur in maxime numquam. Sint quas nobis voluptatum nemo consequatur aperiam ea sit eveniet, perferendis iure ?
	// 	![image](https://images.unsplash.com/photo-1523875194681-bedd468c58bf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1742&q=80)`,
	// 	answers: [
	// 		{
	// 			answerId: "f797e6fc-8d03-41a2-9c93-9fcb3da0c147",
	// 			content: "Statement 1",
	// 			isCorrect: false
	// 		},
	// 		{
	// 			answerId: "ef88d034-a0ea-4e85-bfc0-4381021f2449",
	// 			content: "Statement 2",
	// 			isCorrect: false
	// 		},
	// 		{
	// 			answerId: "d0a1af94-92ea-4415-b1e3-cca7218b132a",
	// 			content: "Statement 3",
	// 			isCorrect: false
	// 		},
	// 		{
	// 			answerId: "1220605d-e1b2-4933-bc7f-31b73c7a17bf",
	// 			content: "Statement 4",
	// 			isCorrect: false
	// 		}
	// 	],
	// 	requireExplanationForAnswerIds: "ef88d034-a0ea-4e85-bfc0-4381021f2449",
	// 	withCertainty: false,
	// 	hints: []
	// },
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
import { join } from 'path';

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

const mdContent = readFileSync(join(__dirname, "markdown-example.mdx"), "utf-8");

function createLesson(title: string) {
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
					url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
				},
				meta: {
					duration: 300
				}
			},
			{
				type: "article",
				value: {
					content: mdContent
				},
				meta: {
					estimatedDuration: 300
				}
			}
		] as LessonContent,
		quiz: questions,
		meta: {}
	};

	lesson.meta = createLessonMeta(lesson as any) as unknown as Prisma.JsonObject;

	return lesson;
}

const reactLessons = [
	{
		title: "Installation",
		description: faker.lorem.paragraphs(3),
		content: [
			createLesson("Start a New React Project"),
			createLesson("Add React to a Website"),
			createLesson("Editor Setup"),
			createLesson("React Developer Tools")
		]
	},
	{
		title: "Describing the UI",
		description: faker.lorem.paragraphs(3),
		content: [
			createLesson("Your First Component"),
			createLesson("Importing and Exporting Components"),
			createLesson("Writing Markup with JSX"),
			createLesson("JavaScript in JSX with Curly Braces"),
			createLesson("Passing Props to a Component"),
			createLesson("Conditional Rendering"),
			createLesson("Rendering Lists"),
			createLesson("Keeping Components Pure")
		]
	},
	{
		title: "Adding Interactivity",
		description: faker.lorem.paragraphs(3),
		content: [
			createLesson("Responding to Events"),
			createLesson("State: A Component's Memory"),
			createLesson("Render and Commit"),
			createLesson("State as a Snapshot"),
			createLesson("Queueing a Series of State Updates"),
			createLesson("Updating Objects in State"),
			createLesson("Updating Arrays in State")
		]
	},
	{
		title: "Managing State",
		description: faker.lorem.paragraphs(3),
		content: [
			createLesson("Reacting to Input with State"),
			createLesson("Choosing the State Structure"),
			createLesson("Sharing State Between Components"),
			createLesson("Preserving and Resetting State"),
			createLesson("Extracting State Logic into a Reducer"),
			createLesson("Passing Data Deeply with Context"),
			createLesson("Scaling Up with Reducer and Context")
		]
	},
	{
		title: "Escape Hatches",
		description: faker.lorem.paragraphs(3),
		content: [
			createLesson("Escape Hatches"),
			createLesson("Referencing Values with Refs"),
			createLesson("Manipulating the DOM with Refs"),
			createLesson("Synchronizing with Effects"),
			createLesson("You Might Not Need an Effect"),
			createLesson("Lifecycle of Reactive Effects"),
			createLesson("Separating Events from Effects"),
			createLesson("Removing Effect Dependencies"),
			createLesson("Reusing Logic with Custom Hooks")
		]
	}
];

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
					connect: extractLessonIds(reactLessons).map(lessonId => ({ lessonId }))
				},
				teams: {
					create: []
				}
			}
		}
	},
	{
		name: "Albus-Dumbledore",
		accounts: {
			create: [
				{
					provider: "demo",
					providerAccountId: "albus-dumbledore",
					type: "demo-account"
				}
			]
		},
		author: {
			create: {
				displayName: "Albus Dumbledore",
				slug: "albus-dumbledore"
			}
		}
	},
	{
		name: "Minerva-McGonagall",
		accounts: {
			create: [
				{
					provider: "demo",
					providerAccountId: "minerva-mcgonagall",
					type: "demo-account"
				}
			]
		},
		author: {
			create: {
				displayName: "Minerva McGonagall",
				slug: "minerva-mcgonagall"
			}
		}
	}
];

const enrollments: Prisma.EnrollmentCreateManyInput[] = [
	{
		status: "ACTIVE",
		createdAt: new Date(2022, 4, 20),
		courseId: courses[0].courseId,
		username: students[0].username
	}
];

const completedLessons: Prisma.CompletedLessonCreateManyInput[] = extractLessonIds(reactLessons)
	.slice(0, 7)
	.map((lessonId, index) => ({
		lessonId: lessonId,
		courseId: courses[0].courseId,
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
	await prisma.lesson.deleteMany();

	console.log("😅 Seeding...");
	await prisma.subject.createMany({ data: subjects });
	console.log("✅ Subjects");
	await prisma.specialization.createMany({ data: specializations });
	console.log("✅ Specialties");
	await prisma.course.createMany({ data: courses });
	console.log("✅ Courses");
	await prisma.lesson.createMany({
		data: reactLessons.flatMap(chapter => chapter.content.map(lesson => lesson))
	});
	console.log("✅ Lessons");
	await createUsers();
	console.log("✅ Users");
	await prisma.enrollment.createMany({ data: enrollments });
	console.log("✅ Enrollments");
	await prisma.completedLesson.createMany({ data: completedLessons });
	console.log("✅ Completed Lessons");
	await prisma.learningDiary.createMany({ data: learningDiaries });
	console.log("✅ LearningDiaries");

	await prisma.specialization.update({
		where: { specializationId: 1 },
		data: {
			courses: {
				connect: courses.map(course => ({ courseId: course.courseId }))
			}
		}
	});

	console.log("✅ Connect Specialization to Course");

	for (const author of authors) {
		await prisma.user.create({ data: author });
	}
	console.log("✅ Authors");

	await javaExample();
	await psychologyExample();
	await mathExample();

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
