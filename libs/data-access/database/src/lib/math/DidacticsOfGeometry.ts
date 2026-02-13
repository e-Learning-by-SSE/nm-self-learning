import { faker } from "@faker-js/faker";
import {
	createArticle,
	createCourse,
	createLesson,
	createMultipleChoice,
	createTextQuestion,
	createVideo
} from "../seed-functions";

const courseId = faker.string.alphanumeric(8);

const ch_Begriffslernen = {
	title: "Begriffslernen in der Grundschule",
	description: "Begriffslernen in der Grundschule.",
	content: [
		createLesson({
			courseId,
			title: "Räumliche Orientierung",
			subtitle: null,
			description: "Räumliche Orientierung in der Grundschule",
			content: [
				createVideo(
					"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/01_raeumliche%20Orientierung.mp4",
					354
				),
				createArticle({
					mdContent:
						"# Markdown Text\n\nSome markdown information here about Räumliche Orientierung",
					estimatedDuration: 30
				}),
				createArticle({
					mdContent:
						"# Another Markdown Text\n\nSome markdown information here about Räumliche Orientierung",
					estimatedDuration: 30
				})
			],
			questions: [
				createMultipleChoice({
					question:
						"![Ein Schrank mit 9 Fächern und Spielzeug](https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Begriffslernen-GS-01.png)\r\nWelche zentralen Lerninhalte hat diese Aufgabe? Kreuzen Sie alle richtigen Antworten an.",
					answers: [
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
				}),
				createMultipleChoice({
					question: "Finden Sie die wahre Aussage.",
					answers: [
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
					]
				})
			]
		})
	]
};

const ch_Groessen = {
	title: "Größen und Maße in der Sekundarstufe",
	description: "Größen und Maße in der Sekundarstufe",
	content: [
		createLesson({
			courseId,
			title: "Einheitsquadrate und Einheitswürfel",
			subtitle: "",
			description: "Einheitsquadrate und Einheitswürfel",
			content: [
				createVideo(
					"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/12_02_Geometrie_Groessen_und_Messen_Einheitsquadrate_und_Wuerfel.mp4",
					248
				)
			],
			questions: [
				createMultipleChoice({
					question:
						"Welcher Aspekt des Messen wird mithilfe von Einheitsquadraten und Einheitswürfeln verdeutlicht?",
					answers: [
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
				}),
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
		}),
		createLesson({
			courseId,
			title: "Flächenformel",
			subtitle: "",
			description: "Herleitung Flächenformel",
			content: [
				createArticle({
					mdContent:
						"#Geplante Lerneinheit\r\nHier ist ein Video zur Herleitung der Flächenformel geplant",
					estimatedDuration: 10
				})
			],
			questions: [
				createMultipleChoice({
					question:
						"![Verschiedene mathematische zweidimensionale Formen auf einem kariertem Papier](https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Groessen_und_Masse__Sek_I.jpg)\r\nWelche Axiome werden bei dieser Aufgabe genutzt? Kreuzen Sie alle richtigen Antworten an.",
					answers: [
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
				})
			]
		})
	]
};

const ch_Figuren = {
	title: "Figuren in der Grundschule",
	description: "Figuren in der Grundschule",
	content: [
		createLesson({
			courseId,
			title: "ebene Figuren - Ziele in der Grundschule",
			subtitle: null,
			description: "ebene Figuren - Ziele in der Grundschule",
			content: [
				createVideo(
					"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/01_Ziele_Primarstufe.mp4",
					281
				)
			],
			questions: [
				createMultipleChoice({
					question:
						"Was ist keine Möglichkeit in Bezug auf den Umgang mit ebenen Figuren in der Grundschule?",
					answers: [
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
				}),
				createMultipleChoice({
					question: "Finden Sie die wahre Aussage/n.",
					answers: [
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
					]
				})
			]
		})
	]
};

const ch_Symmetrien = {
	title: "Symmetrien in der Grundschule",
	description: "Symmetrien in der Grundschule",
	content: [
		createLesson({
			courseId,
			title: "Symmetrie als fundamentale Idee",
			subtitle: "",
			description: "Symmetrie als fundamentale Idee",
			content: [
				createVideo(
					"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/01_01_Symmetrie_als_fundamentale_Idee.mp4",
					152
				)
			],
			questions: [
				createMultipleChoice({
					question: "Welcher Aspekt trifft nicht auf fundamentale Ideen zu?",
					answers: [
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
					]
				}),
				createMultipleChoice({
					question:
						"(Kreuzen Sie die falsche Antwort an.) Symmetrie ist eine fundamentale Idee im Mathematikunterricht, da...  ",
					answers: [
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
				})
			]
		}),
		createLesson({
			courseId,
			title: "Kongruenzabbildungen durch Handlungen",
			subtitle: "",
			description: "Kongruenzabbildungen durch Handlungen ",
			content: [
				createVideo(
					"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/01_04_01_Kongruenzabbildungen_durch_Handlungen.mp4",
					172
				)
			],
			questions: [
				createMultipleChoice({
					question:
						"Welche Handlung bietet sich nicht naheliegend für die Achsenspiegelung in der Grundschule an?",
					answers: [
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
				}),
				createMultipleChoice({
					question:
						"![Marienkäfer](https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Symmetrie_Aufgabenstellung.png)\r\nWelche Aspekte der Spiegelung werden bei dieser Aufgabe angesprochen?",
					answers: [
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
				})
			]
		})
	]
};
const ch_Muster = {
	title: "Muster, Ornamente, Parkettierungen in der Grundschule",
	description: "Muster, Ornamente, Parkettierungen in der Grundschule",
	content: [
		createLesson({
			courseId,
			title: "Grundlagen",
			subtitle: "",
			description: "Grundlagen",
			content: [
				createVideo(
					"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/08_01_01_geo_muster_angewandte_Symmetrie_grundlagen.mp4",
					79
				)
			],
			questions: [
				createMultipleChoice({
					question:
						"Welche Themen sollten Muster, Ornamenten und Parkettierungen im Lehrplan vorangestellt werden? Kreuzen Sie alle richtigen Antworten an.",
					answers: [
						{
							content: "Kavalierperspektive",
							isCorrect: false
						},
						{
							content: "Kongruenzabbildungen",
							isCorrect: true
						},
						{
							content: "Konstruktionen",
							isCorrect: false
						},
						{
							content: "Symmetrien",
							isCorrect: true
						}
					]
				})
			]
		}),
		createLesson({
			courseId,
			title: "Ornamente",
			subtitle: "",
			description: "Ornamente",
			content: [
				createVideo(
					"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/08_01_02_geo_muster_angewandte_Symmetrie_Ornamente.mp4",
					207
				)
			],
			questions: [
				createMultipleChoice({
					question: "Welche Art von Symmetrie kommt bei Ornamenten meistens vor?",
					answers: [
						{
							content: "Achsensymmetrie",
							isCorrect: false
						},
						{
							content: "Punktsymmetrie",
							isCorrect: false
						},
						{
							content: "Schubsymmetrie",
							isCorrect: true
						},
						{
							content: "Drehsymmetrie",
							isCorrect: false
						}
					]
				})
			]
		})
	]
};

const ch_Konstruieren = {
	title: "Konstruieren",
	description: "Begriffslernen in der Grundschule.",
	content: [
		createLesson({
			courseId,
			title: "Konstruktionswerkzeuge - Allgemein",
			subtitle: "",
			description: "Konstruktionswerkzeuge - Allgemein",
			content: [
				createVideo(
					"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/01_01%20Konstruktionswerkzeuge%20allgemein.mp4",
					203
				)
			],
			questions: [
				createMultipleChoice({
					question: "Kreuzen Sie die richtigen Aussagen an.",
					answers: [
						{
							content:
								"Alle Möglichkeiten der Faltung sind auch mit Lineal und Zirkel vernehmbar.",
							isCorrect: false
						},
						{
							content:
								"Das Geodreieck fasst einzelne Konstruktionsschritte von Zirkel und Lineal zusammen.",
							isCorrect: true
						},
						{
							content:
								"In der Antike wurde für eine Konstruktion häufig auf Sand gemalt.",
							isCorrect: true
						},
						{
							content:
								"Die Bedeutung von Konstruktion im Geometrieunterricht hat in den letzten Jahren zugenommen.",
							isCorrect: false
						}
					]
				}),
				createMultipleChoice({
					question: "Welche Werkzeuge sind Grundwerkzeuge nach Euklid?",
					answers: [
						{
							content: "Zirkel",
							isCorrect: true
						},
						{
							content: "Lineal ",
							isCorrect: true
						},
						{
							content: "Geodreieck",
							isCorrect: false
						},
						{
							content: "Ellipsenzirkel",
							isCorrect: false
						},
						{
							content: "Parallelzeichner",
							isCorrect: false
						}
					]
				}),
				createMultipleChoice({
					question: "Welche der folgenden Aussagen gehört nicht zu Euklids Postulaten? ",
					answers: [
						{
							content: "zwischen zwei Punkten kann man eine Strecke ziehen",
							isCorrect: false
						},
						{
							content: "ein Rechteck hat vier rechte Winkel ",
							isCorrect: true
						},
						{
							content:
								"in Kreis kann durch ein beliebigen Radius um einen Punkt beschrieben werden",
							isCorrect: false
						},
						{
							content: "gerade Strecken sind beliebig verlängerbar",
							isCorrect: false
						}
					]
				})
			]
		}),

		createLesson({
			courseId,
			title: "Historischer Hintergrund von Konstruktionswerkzeugen",
			subtitle: "",
			description: "Historischer Hintergrund von Konstruktionswerkzeugen",
			content: [
				createVideo(
					"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/01_02%20historischer%20Hintergrund.mp4",
					129
				)
			],
			questions: [
				createMultipleChoice({
					question: "Kreuzen Sie die richtigen Aussagen an.",
					answers: [
						{
							content:
								"In der griechischen Antike wurde damit begonnen mathematisches Wissen zu systematisieren und zu beweisen. ",
							isCorrect: false
						},
						{
							content:
								"Schon vor Euklid haben die Menschen geometrische Beweise herangeführt.",
							isCorrect: true
						},

						{
							content:
								"Im alten Ägypten wurde Geometrie für alltägliche Erfahrungen wie beim Bauen oder bei der Landwirtschaft genutzt.",
							isCorrect: true
						}
					]
				})
			]
		}),
		createLesson({
			courseId,
			title: "Doppelfunktion von Konstruktion",
			subtitle: "",
			description: "Doppelfunktion von Konstruktion",
			content: [
				createVideo(
					"https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/01_03%20Doppelfunktion%20von%20Konstruktion.mp4",
					129
				)
			],
			questions: [
				createMultipleChoice({
					question:
						"Welche Aussage über die Doppelfunktion von Konstruktionen ist falsch?",
					answers: [
						{
							content:
								"Die euklidischen Postulate beschreiben, wie man ein Objekt mechanisch und durch geeignete Maßnahmen herstellen kann. ",
							isCorrect: false
						},
						{
							content:
								"Durch die Postulate können theoretische Aspekte überlegt werden, welche Objekte konstruierbar sind und welche nicht. ",
							isCorrect: false
						},
						{
							content:
								"Wenn Objekte nach den euklidischen Postulaten konstruiert werden können, existieren diese in der euklidischen Geometrie. ",
							isCorrect: false
						},
						{
							content:
								"Euklid warf verschiedene Fragen auf, die durch seine Schüler mit Hilfe der Postulate gelöst werden konnten. ",
							isCorrect: true
						}
					]
				}),
				createMultipleChoice({
					question:
						"Durch die Postulate und die Doppelfunktion von Konstruktionen können in der Schule verschiedene Fragen aufgeworfen werden. Welche gehört nicht dazu?",
					answers: [
						{
							content:
								"Welche Angaben müssen gemacht werden, damit eine Konstruktion gelingt? ",
							isCorrect: false
						},
						{
							content:
								"Welche Angaben müssen für ein Dreieck gemacht werden, damit die Konstruktion eindeutig ist?",
							isCorrect: false
						},
						{
							content:
								"Welche Angaben müssen gemacht werden, damit man einen Winkel in drei Teile teilen kann? ",
							isCorrect: true
						},
						{
							content:
								"Welche Angaben müssen gemacht werden, damit Mitschülerinnen die Konstruktion genauso durchführen kann, wie man selbst? ",
							isCorrect: false
						}
					]
				})
			]
		})
	]
};

export const chapters = [
	ch_Begriffslernen,
	ch_Figuren,
	ch_Konstruieren,
	ch_Symmetrien,
	ch_Muster,
	ch_Groessen
];

export const course = createCourse({
	courseId,
	subjectId: "mathematik",
	specializationId: "didaktik-der-geometrie",
	title: "Didaktik der Geometrie",
	imgUrl: "https://staging.sse.uni-hildesheim.de:9006/upload/didactics_of_mathematics/Didaktik_der_Geometrie.png",
	chapters
});
