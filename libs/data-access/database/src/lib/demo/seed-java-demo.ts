import {
	createArticle,
	createAuthor,
	createCourse,
	createLesson,
	createMultipleChoice,
	createTextQuestion,
	createVideo,
	read,
	seedCaseStudy
} from "../seed-functions";
import { seedJavaDemoSkills } from "./seed-java-demo-skills";

const chapters = [
	{
		title: "Einführung",
		description:
			"Einführung und Motivation für den Einsatz von Java. Einrichtung einer Arbeitsumgebung zur Entwicklung von Java-Anwendungen.",
		content: [
			createLesson({
				title: "Einleitung & Motivation",
				subtitle: "Einstieg in die Welt von Java",
				description: "Download und Installation des JDKs",
				content: [
					createVideo(
						"https://staging.sse.uni-hildesheim.de:9006/upload/ung7m79i-Java%20010%20-%20Motivation.mp4",
						15
					)
				],
				questions: [
					createMultipleChoice({
						question: "Weshalb sollten IT-Studierende programmieren lernen?",
						answers: [
							{
								content: "Zum Erstellen technischer Zeichnungen",
								isCorrect: false
							},
							{
								content: "Es handelt es um eine Grundfertigkeit im IT-Bereich",
								isCorrect: true
							},
							{
								content: "Zum Erstellen von Programmen",
								isCorrect: true
							}
						]
					})
				]
			}),
			createLesson({
				title: "Installation des JDKs",
				subtitle: null,
				description: "Download und Installation des JDKs",
				content: [
					createArticle(
						"# Installation des JDKs\r\n1. Gehen Sie auf <https://adoptopenjdk.net/>\r\n1. Wählen Sie sich dort das JDK aus, wir verwenden __OpenJDK 16 (Latest)__ in Verbindung mit __HotSpot__\r\n1. Installieren sie diese und aktivieren Sie den Haken, dass die __Java_HOME__ Variable angepasst werden soll",
						20
					)
				],
				questions: [
					createTextQuestion('Wofür steht "JDK"?', [
						"Java Development Kit",
						"java development kit"
					]),
					createMultipleChoice({
						question: "Auf welchen Seiten wird ein JDK angeboten?",
						answers: [
							{
								content: "adoptopenjdk.net",
								isCorrect: true
							},
							{
								content: "java.oracle.com",
								isCorrect: true
							},
							{
								content: "uni-hildesheim.de",
								isCorrect: false
							}
						],
						hints: [
							"Die Uni Hi bietet selber kein JDK an.",
							"Die ersten beiden Antworten sind korrekt."
						]
					})
				]
			}),
			createLesson({
				title: "Hello World",
				subtitle: "Das erste Programm",
				description: read("demo/java-hello-world-description.mdx"),
				content: [
					createVideo(
						"https://staging.sse.uni-hildesheim.de:9006/upload/9b2dnsoa8-Java 011 - Hello World.mp4",
						10
					)
				],
				questions: [
					createTextQuestion(
						"Was genau gibt das Programm aus dem gezeigten Beispiel aus?",
						["Hello World"],
						[
							'Der Text der zwischen den Gänsefüßchen innerhalb von System.out.println("") steht.'
						]
					)
				]
			}),
			createLesson({
				title: "Compiler & Intepreter",
				subtitle: "Vom Quellcode zur Ausführung eines Programms",
				description:
					"* Nutzung des Compilers um einen Quelltext in Maschinensprache zu übersetzen\r\n* Nutzung des Interpreters um ein übersetztes Programm auszuführen",
				content: [
					createVideo(
						"https://staging.sse.uni-hildesheim.de:9006/upload/ugo3vrlv-Java%20012%20-%20Compiler,%20Interpreter.mp4",
						40
					)
				],
				questions: [
					createMultipleChoice({
						question: "Was ist die Aufgabe des Compilers",
						answers: [
							{
								content: "Ausführen eines Programms",
								isCorrect: false
							},
							{
								content:
									"Den Quellcode eines Programms in maschinen lesbaren Code überführen",
								isCorrect: true
							}
						]
					}),
					createMultipleChoice({
						question: "Was ist die Aufgabe des Interpreters",
						answers: [
							{
								content: "Ausführen eines Programms",
								isCorrect: true
							},
							{
								content:
									"Den Quellcode eines Programms in maschinen lesbaren Code überführen",
								isCorrect: false
							}
						]
					})
				]
			})
		]
	}
];

const courses = [
	createCourse(
		"informatik",
		"softwareentwicklung",
		"Objectorientierte Programmierung mit Java",
		"Einführung in die Welt von Java",
		"## Lernziele\r\n* Einrichtung der Arbeitsumgebung\r\n* Imperative Programmierung\r\n* Objektorientierte Programmierung\r\n\r\nEs werden keine Informatik- / Programierkentnisse vorausgesetzt",
		"https://cdn.iconscout.com/icon/free/png-512/java-43-569305.png",
		chapters
	)
];

const authors = [
	createAuthor({
		userName: "gosling@example.com",
		name: "J. Gosling",
		imgUrl: "https://www.pngall.com/wp-content/uploads/7/Ryan-Gosling-PNG-Picture.png",
		lessons: chapters,
		courses: courses
	})
];

export async function seedJavaDemo(): Promise<void> {
	await seedJavaDemoSkills();
	await seedCaseStudy("Java", courses, chapters, authors);
}
