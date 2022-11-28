import {
    createArticle,
    createCourse,
    createLesson,
    createMultipleChoice,
    createTextQuestion,
    createVideo,
} from '../seed-functions';

export const chapters = [
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
						"![Ein Schrank mit 9 Fächern und Spielzeug](https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Begriffslernen-GS-01.png)\r\nWelche zentralen Lerninhalte hat diese Aufgabe? Kreuzen Sie alle richtigen Antworten an.",
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
	},
	{
		title: "Größen und Maße in der Sekundarstufe",
		description: "Größen und Maße in der Sekundarstufe",
		content: [
			createLesson(
				"Einheitsquadrate und Einheitswürfel",
				null,
				"Einheitsquadrate und Einheitswürfel",
				[
					createVideo(
						"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/12_02_Geometrie_Groessen_und_Messen_Einheitsquadrate_und_Wuerfel.mp4",
						248
					)
				],
				[
					createMultipleChoice(
						"Welcher Aspekt des Messen wird mithilfe von Einheitsquadraten und Einheitswürfeln verdeutlicht?",
						[
							{
								content: "Auslegungsaspekt",
								isCorrect: true
							},
							{
								content: "Vergleichsaspekt",
								isCorrect: false
							},
							{
								content: "Messgerät-Aspekt",
								isCorrect: false
							},
							{
								content: "Messen als Berechnungsaspekt",
								isCorrect: false
							}
						]
					),
					createTextQuestion(
						"Welches Schülerproblematische Thema kann mithilfe von Einheitsquadraten und Würfeln visualisiert werden?",
						[
							"Herleitung Umrechnungsfaktor",
							"Umrechnungsfaktor",
							"Umrechung",
							"Herleitung Umrechnung"
						]
					)
				]
			),
			createLesson(
				"Flächenformel",
				null,
				"Herleitung Flächenformel",
				[
					createArticle(
						"#Geplante Lerneinheit\r\nHier ist ein Video zur Herleitung der Flächenformel geplant",
						10
					)
				],
				[
					createMultipleChoice(
						"![Verschiedene mathematische zweidimensionale Formen auf einem kariertem Papier](https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Groessen_und_Masse__Sek_I.jpg)\r\nWelche Axiome werden bei dieser Aufgabe genutzt? Kreuzen Sie alle richtigen Antworten an.",
						[
							{
								content: "Kongruenzaxiom",
								isCorrect: true
							},
							{
								content: "Additivität",
								isCorrect: true
							},
							{
								content: "Nichtnegativität",
								isCorrect: false
							},
							{
								content: "Normierungsaxiom",
								isCorrect: false
							}
						]
					)
				]
			)
		]
	}
];

export const course = createCourse(
	2,
	12,
	"Didaktik der Geometrie",
	null,
	null,
	"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_der_Geometrie.png",
	chapters
);
