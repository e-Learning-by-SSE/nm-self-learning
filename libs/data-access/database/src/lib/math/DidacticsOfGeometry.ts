import {
    createArticle,
    createCourse,
    createLesson,
    createMultipleChoice,
    createTextQuestion,
    createVideo,
} from '../seed-functions';

const ch_Begriffslernen = {
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
							content: "Erlernen von Begriffen, die geometrische Körper beschreiben",
							isCorrect: false
						},
						{
							content:
								"Abstrahieren von geometrisch unwesentlichen Eigenschaften (wie z. B. die Farbe)",
							isCorrect: false
						},
						{
							content: "Erkunden und Benennen von Bestandteilen geometrischer Körper",
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
};

const ch_Groessen = {
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
						"Umrechnung",
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
};

const ch_Figuren = {
	title: "Figuren in der Grundschule",
	description: "Figuren in der Grundschule",
	content: [
		createLesson(
			"ebene Figuren - Ziele in der Grundschule",
			null,
			"ebene Figuren - Ziele in der Grundschule",
			[
				createVideo(
					"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/01_Ziele_Primarstufe.mp4",
					281
				)
			],
			[
				createMultipleChoice(
					"Was ist keine Möglichkeit in Bezug auf den Umgang mit ebenen Figuren in der Grundschule?",
					[
						{
							content: "Konstruktion mit Zirkel und Lineal",
							isCorrect: true
						},
						{
							content: "Spannen von Figuren Am Geobrett ",
							isCorrect: false
						},
						{
							content: "„Bauen“ von Figuren mit ebenen Legeplättchen ",
							isCorrect: false
						},
						{
							content: "Falten und Zerlegen von Figuren",
							isCorrect: false
						},
						{
							content: "Sortieren und Zuordnen von ebenen Figuren",
							isCorrect: false
						}
					]
				),
				createMultipleChoice("Finden Sie die wahre Aussage/n.", [
					{
						content:
							"In der Primarstufe geht es um ein grundsätzliches Kennenlernen ebener Figuren. ",
						isCorrect: true
					},
					{
						content:
							"Eine exakte Konstruktion von Figuren steht im Vordergrund in der Primarstufe.",
						isCorrect: false
					},
					{
						content:
							"Der Bezug zur Fachsprache (Eigenschaften und Bestandteile von Figuren) wird bereits in der Grundschule gelegt.",
						isCorrect: true
					}
				])
			]
		)
	]
};

const ch_Symmetrien = {
	title: "Symmetrien in der Grundschule",
	description: "Symmetrien in der Grundschule",
	content: [
		createLesson(
			"Symmetrie als fundamentale Idee",
			null,
			"Symmetrie als fundamentale Idee",
			[
				createVideo(
					"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/01_01_Symmetrie_als_fundamentale_Idee.mp4",
					152
				)
			],
			[
				createMultipleChoice("Welcher Aspekt trifft nicht auf fundamentale Ideen zu?", [
					{
						content: "Starke Bezüge zur Wirklichkeit",
						isCorrect: false
					},
					{
						content: "Verschiedene Aspekte und Bezüge",
						isCorrect: false
					},
					{
						content: "Hoher innerer Beziehungsreichtum",
						isCorrect: false
					},
					{
						content: "Nur in einem Schuljahr vorkommend ",
						isCorrect: true
					}
				]),
				createMultipleChoice(
					"(Kreuzen Sie die falsche Antwort an.) Symmetrie ist eine fundamentale Idee im Mathematikunterricht, da...  ",
					[
						{
							content: "...sie einen großen Umweltbezug aufweist. ",
							isCorrect: false
						},
						{
							content: "... unterschiedliche Zugänge zu diesem Thema möglich sind. ",
							isCorrect: false
						},
						{
							content: "... man Symmetrie handelnd erkunden kann.",
							isCorrect: true
						},
						{
							content:
								"... Symmetrie in verschiedenen Themen der Mathematik auftritt.  ",
							isCorrect: false
						}
					]
				)
			]
		),
		createLesson(
			"Kongruenzabbildungen durch Handlungen",
			null,
			"Kongruenzabbildungen durch Handlungen ",
			[
				createVideo(
					"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/01_04_01_Kongruenzabbildungen_durch_Handlungen.mp4",
					172
				)
			],
			[
				createMultipleChoice(
					"Welche Handlung bietet sich nicht naheliegend für die Achsenspiegelung in der Grundschule an?",
					[
						{
							content: "Sortieren",
							isCorrect: true
						},
						{
							content: "Spiegeln",
							isCorrect: false
						},
						{
							content: "Falten",
							isCorrect: false
						},
						{
							content: "Schneiden",
							isCorrect: false
						}
					]
				),
				createMultipleChoice(
					"![Marienkäfer](https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Symmetrie_Aufgabenstellung.pngg)\r\nWelche Aspekte der Spiegelung werden bei dieser Aufgabe angesprochen?",
					[
						{
							content:
								"Es wird untersucht, was passiert, wenn der Spiegel auf einer Figur an verschiedenen Stellen aufgesetzt wird.",
							isCorrect: true
						},
						{
							content:
								"Spiegelbilder werden mit Hilfe eines Spiegels vervollständigt.",
							isCorrect: false
						},
						{
							content: "Mit Hilfe des Spiegels werden Fehler gefunden.",
							isCorrect: false
						},
						{
							content:
								"Der Spiegel nicht nur senkrecht, sondern in verschiedenen Winkel zur Figur aufgesetzt wird.",
							isCorrect: true
						},
						{
							content:
								"Der Spiegel wird zur Figur hin bzw. von der Figur weg bewegt wird.",
							isCorrect: false
						}
					]
				)
			]
		)
	]
};

export const chapters = [ch_Begriffslernen, ch_Figuren, ch_Symmetrien, ch_Groessen];

export const course = createCourse(
	2,
	12,
	"Didaktik der Geometrie",
	null,
	null,
	"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_der_Geometrie.png",
	chapters
);
