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

const chapters = [
	{
		title: "Einführung",
		description:
			"Einführung und Motivation für den Einsatz von Java. Einrichtung einer Arbeitsumgebung zur Entwicklung von Java-Anwendungen.",
		content: [
			createLesson(
				"Einleitung & Motivation",
				"Einstieg in die Welt von Java",
				"Download und Installation des JDKs",
				[
					createVideo(
						"https://staging.sse.uni-hildesheim.de:9006/upload/ung7m79i-Java%20010%20-%20Motivation.mp4",
						15
					)
				],
				[
					createMultipleChoice("Weshalb sollten IT-Studierende programmieren lernen?", [
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
					])
				]
			),
			createLesson(
				"Installation des JDKs",
				null,
				"Download und Installation des JDKs",
				[
					createArticle(
						"# Installation des JDKs\r\n1. Gehen Sie auf <https://adoptopenjdk.net/>\r\n1. Wählen Sie sich dort das JDK aus, wir verwenden __OpenJDK 16 (Latest)__ in Verbindung mit __HotSpot__\r\n1. Installieren sie diese und aktivieren Sie den Haken, dass die __Java_HOME__ Variable angepasst werden soll",
						20
					)
				],
				[
					createTextQuestion('Wofür steht "JDK"?', [
						"Java Development Kit",
						"java development kit"
					]),
					createMultipleChoice(
						"Auf welchen Seiten wird ein JDK angeboten?",
						[
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
						[
							"Die Uni Hi bietet selber kein JDK an.",
							"Die ersten beiden Antworten sind korrekt."
						]
					)
				]
			),
			createLesson(
				"Hello World",
				"Das erste Programm",
				read("demo/java-hello-world-description.mdx"),
				[
					createVideo(
						"https://staging.sse.uni-hildesheim.de:9006/upload/9b2dnsoa8-Java 011 - Hello World.mp4",
						10
					)
				],
				[
					createTextQuestion(
						"Was genau gibt das Programm aus dem gezeigten Beispiel aus?",
						["Hello World"],
						[
							'Der Text der zwischen den Gänsefüßchen innerhalb von System.out.println("") steht.'
						]
					)
				]
			),
			createLesson(
				"Compiler & Intepreter",
				"Vom Quellcode zur Ausführung eines Programms",
				"* Nutzung des Compilers um einen Quelltext in Maschinensprache zu übersetzen\r\n* Nutzung des Interpreters um ein übersetztes Programm auszuführen",
				[
					createVideo(
						"https://staging.sse.uni-hildesheim.de:9006/upload/ugo3vrlv-Java%20012%20-%20Compiler,%20Interpreter.mp4",
						40
					)
				],
				[
					createMultipleChoice("Was ist die Aufgabe des Compilers", [
						{
							content: "Ausführen eines Programms",
							isCorrect: false
						},
						{
							content:
								"Den Quellcode eines Programms in maschinen lesbaren Code überführen",
							isCorrect: true
						}
					]),
					createMultipleChoice("Was ist die Aufgabe des Interpreters", [
						{
							content: "Ausführen eines Programms",
							isCorrect: true
						},
						{
							content:
								"Den Quellcode eines Programms in maschinen lesbaren Code überführen",
							isCorrect: false
						}
					])
				]
			)
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
	createAuthor(
		"J. Gosling",
		"https://www.pngall.com/wp-content/uploads/7/Ryan-Gosling-PNG-Picture.png",
		chapters,
		courses
	)
];

export async function javaExample(): Promise<void> {
	await seedCaseStudy("Java", courses, chapters, authors);
}
