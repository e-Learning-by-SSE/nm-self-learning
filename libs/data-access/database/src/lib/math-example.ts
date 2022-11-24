import {
    createArticle,
    createAuthor,
    createCourse,
    createLesson,
    createMultipleChoice,
    createTextQuestion,
    createVideo,
    read,
    seedCaseStudy,
} from './seed-functions';

const chapters = [
	{
		title: "Begriffslernen in der Grundschule",
		description: "Begriffslernen in der Grundschule.",
		content: [
			createLesson(
				"Räumliche Orientierung",
				null,
				"Räumliche Orientierung in der Grundschule",
				[
					createVideo(
						"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/01_raeumliche%20Orientierung.mp4",
						354
					)
				],
				[
					createMultipleChoice(
						"Welche zentralen Lerninhalte hat diese Aufgabe? Kreuzen Sie alle richtigen Antworten an.",
						[
							{
								content: "Förderung der räumliche Orientierung ",
								isCorrect: true
							},
							{
								content: "Erlernen von Begriffen, die Lagebeziehungen ausdrücken ",
								isCorrect: true
							},
							{
								content:
									"Erlernen von Begriffen, die geometrische Körper beschreiben",
								isCorrect: false
							},
							{
								content:
									"Abstrahieren von geometrisch unwesentlichen Eigenschaften (wie z. B. die Farbe)",
								isCorrect: false
							},
							{
								content:
									"Erkunden und Benennen von Bestandteilen geometrischer Körper",
								isCorrect: false
							}
						]
					),
					createMultipleChoice("Finden Sie die wahre Aussage.", [
						{
							content:
								"Räumliche Orientierung geht von Alltagserfahrungen aus, die dann mathematisch präzisiert werden sollen.",
							isCorrect: true
						},
						{
							content:
								"Schulbuchaufgaben eignen sich besser für Übungen mit räumlicher Orientierung als Übungen mit realen Objekten.",
							isCorrect: false
						},
						{
							content:
								"Begriffe wie links oder rechts bleiben in der Fachmathematik bestehen, da es sich hier um einen homogenen Raum handelt.",
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
		2,
		12,
		"Didaktik der Geometrie",
		null,
		null,
		"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Begriffslernen-GS-01.JPG",
		chapters
	)
];

const authors = [
	createAuthor(
		"Meeri-Liisa Beste",
		"https://lsf.uni-hildesheim.de/qisserver/rds?state=medialoader&application=lsf&objectid=14397",
		chapters,
		courses
	),
	createAuthor(
		"Bianca Wolff",
		"https://lsf.uni-hildesheim.de/qisserver/rds?state=medialoader&application=lsf&objectid=14411",
		chapters,
		courses
	)
];

export async function mathExample(): Promise<void> {
	await seedCaseStudy("Didactics of Mathematics", courses, chapters, authors);
}
