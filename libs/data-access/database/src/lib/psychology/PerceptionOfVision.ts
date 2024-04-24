import { LessonType } from "@prisma/client";
import { createCourse, createLesson, createMultipleChoice, createTextQuestion, createVideo } from "../seed-functions";

export const chapters = [
	{
		title: "Sehen - das visuelle System",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				{
					title: "Aufbau und Funktion des Auges",
					subtitle: "Aktivierungsfrage: Welche Aussage zur visuellen Wahrnehmung ist **falsch**?",
					description: "**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 84ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
					content: [createVideo("https://www.youtube.com/watch?v=lwS3fcA3kfg", 385)],
					questions: [
						createTextQuestion(
							"Sequenzielle Fragen zu: Welche Aussage zur visuellen Wahrnehmung ist **falsch**? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nMit Hilfe von Gestaltgesetzen lässt sich erklären, wie wir einzelne Elemente zu Figuren und Formen gruppieren.\r\n",
							["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
							["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
						),
						createTextQuestion(
							"Sequenzielle Fragen zu: Welche Aussage zur visuellen Wahrnehmung ist **falsch**? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nUm Entfernung und Tiefe zu berechnen, nutzen wir unter anderem den Konvergenzwinkel und unseren Augenabstand.\r\n",
							["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
							["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
						),
						createTextQuestion(
							"Sequenzielle Fragen zu: Welche Aussage zur visuellen Wahrnehmung ist **falsch**? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nDer Grund dafür, dass wir im Dunkeln nur unscharf sehen, liegt darin, dass in unserem blinden Fleck ausschließlich Zapfen zu finden sind.\r\n",
							["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
							["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
						),
						createTextQuestion(
							"Sequenzielle Fragen zu: Welche Aussage zur visuellen Wahrnehmung ist **falsch**? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nWenn wir ein Gesicht im Mond oder Formen in Wolken erkennen, sind das Beispiele für top-down-Prozesse.\r\n",
							["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
							["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
						),
						createMultipleChoice({
							question: "Welche Aussage zur visuellen Wahrnehmung ist **falsch**?",
							answers: [
								{
									content:
										"Mit Hilfe von Gestaltgesetzen lässt sich erklären, wie wir einzelne Elemente zu Figuren und Formen gruppieren.",
									isCorrect: false
								},
								{
									content:
										"Um Entfernung und Tiefe zu berechnen, nutzen wir unter anderem den Konvergenzwinkel und unseren Augenabstand.",
									isCorrect: false
								},
								{
									content:
										" Der Grund dafür, dass wir im Dunkeln nur unscharf sehen, liegt darin, dass in unserem blinden Fleck ausschließlich Zapfen zu finden sind.",
									isCorrect: true
								},
								{
									content:
										" Wenn wir ein Gesicht im Mond oder Formen in Wolken erkennen, sind das Beispiele für top-down-Prozesse.",
									isCorrect: false
								}
							],

							hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
						}),

						createMultipleChoice({
							question:
								"Durch welche Mechanismen werden das Auge und seine Bestandteile bewegt?",
							answers: [
								{
									content:
										"Beim optokinetischen Nystagmus wechseln sich schnelle Folgebewegungen mit Sakkadan ab.",
									isCorrect: false
								},
								{
									content:
										"Das Auge wird durch vier Augenmuskeln, die an den das Auge umgebenden Häuten ansetzen, in der Augenhöhle bewegt.",
									isCorrect: false
								},
								{
									content:
										" Der Musculus sphincter pupillae wird durch den sympathischen Ast des vegetativen Nervensystems erregt.",
									isCorrect: false
								},
								{
									content:
										"  Durch die Kontraktion des Ziliarmuskels wird die Linse stärker gewölbt.",
									isCorrect: true
								}
							],
							hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
						})
					]
				}
			),

			createLesson(
				{
					title: "Schärfe des Sehens",
					subtitle: "Aktivierungsfrage: Welche der folgenden Reizqualität(en) kann der Mensch  visuell wahrnehmen?",
					description: "**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 87ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
					content: [createVideo("https://www.youtube.com/watch?v=e4_EROk8TOM", 386)],
					questions: [
						createMultipleChoice({
							question:
								"Welche der folgenden Reizqualität(en) kann der Mensch  visuell wahrnehmen?",
							answers: [
								{
									content: "UV-Strahlen",
									isCorrect: false
								},
								{
									content:
										"Elektromagnetische Strahlung im Bereich von 380 nm bis 780 nm ",
									isCorrect: true
								},
								{
									content: "Infrarotspektrum",
									isCorrect: false
								},
								{
									content: "M-Frequenzen von 87.5 MHz bis 108 MHz ",
									isCorrect: false
								}
							],
							hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
						})
					]
				}
			),

			createLesson(
				{
					title: "Dunkeladaption",
					subtitle: "Aktivierungsfrage: Beim Übertritt von Helligkeit in Dunkelheit…",
					description: "**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 88ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
					content: [createVideo("https://www.youtube.com/watch?v=Z50X-TQq43Q", 387)],
					questions: [
						createMultipleChoice({
							question: "Beim Übertritt von Helligkeit in Dunkelheit…",
							answers: [
								{
									content: "… vergrößern sich die Pupillen.",
									isCorrect: true
								},
								{
									content:
										"… werden die Interneuronen, die die Zapfen blockieren, nun nicht mehr aktiviert.",
									isCorrect: false
								},
								{
									content:
										"… kommt es zu einem kombinierten Sehen von Stäbchen und Zapfen, um den Helligkeitsverlust möglichst gut zu kompensieren.",
									isCorrect: true
								},
								{
									content:
										"… Adaptieren die Pupillen ungefähr genau so langsam die Photosensoren der Retina.",
									isCorrect: false
								}
							],
							hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
						}),

						createMultipleChoice({
							question:
								"Eine Versuchsleiterin präsentiert ihren Probanden verschieden starke Lichtreize in auf- oder absteigender Reihenfolge. Die Probanden müssen jeweils den Punkt angeben, an dem der Reiz (nicht mehr) wahrgenommen wird. Welche Methode nutzt sie?",
							answers: [
								{
									content: "Die Grenzmethode",
									isCorrect: true
								},
								{
									content: "Die Konstanzmethode",
									isCorrect: false
								},
								{
									content: "Die Fusionsmethode",
									isCorrect: false
								},
								{
									content: "Die Herstellungsmethode",
									isCorrect: false
								}
							],
							hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
						})
					]
				}
			)
		]
	},
	{
		title: "Neuronale Verarbeitung der visuellen Reizinformation (Photorezeptoren)",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				{
					title: "Rezeptives Feld", subtitle:
						"Aktivierungsfrage: An welchem der folgenden Phänomene kann es liegen, wenn wir an einer Stelle der Retina einen visuellen Reiz nicht erkennen können?",
					description: "**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 8ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
					content: [createVideo("https://www.youtube.com/watch?v=4jJS4MnkcWw", 389)],
					questions: [
						createMultipleChoice({
							question:
								"An welchem der folgenden Phänomene kann es liegen, wenn wir an einer Stelle der Retina einen visuellen Reiz nicht erkennen können?",
							answers: [
								{
									content: "Pupillenerweiterung",
									isCorrect: false
								},
								{
									content: "Glaskörper",
									isCorrect: false
								},
								{
									content: "Blinder Fleck",
									isCorrect: true
								},
								{
									content: "Papille",
									isCorrect: false
								}
							],
							hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
						})
					]
				}
			),

			createLesson(
				{
					title: "Laterale Hemmung und Kontrastverstärkung",
					subtitle: "Aktivierungsfrage: Was bewirkt die laterale Hemmung der retinalen Ganglienzellen im visuellen System?",
					description: "**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 90ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
					content: [createVideo("https://www.youtube.com/watch?v=X90QcWJ8EcQ", 390)],
					questions: [
						createMultipleChoice({
							question:
								"Was bewirkt die laterale Hemmung der retinalen Ganglienzellen im visuellen System?",
							answers: [
								{
									content: "Konvergenz",
									isCorrect: false
								},
								{
									content: "Divergenz",
									isCorrect: false
								},
								{
									content: "Abschwächung von Kontrasten",
									isCorrect: false
								},
								{
									content: "Verstärkung von Kontrasten",
									isCorrect: true
								}
							],
							hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
						})
					]
				}
			)
		]
	},
	{
		title: "Neuronale Verarbeitung der höheren Zentren des Sehens",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				{
					title: "Corpus geniculatum laterale",
					subtitle: "Aktivierungsfrage: Wie funktioniert die Weiterverarbeitung des Seheindrucks vom Auge bis ins Gehirn?",
					description: "**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 90ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
					content: [createVideo("https://www.youtube.com/watch?v=vMxk5KKB4Jk", 391)],
					questions: [
						createMultipleChoice({
							question:
								"Wie funktioniert die Weiterverarbeitung des Seheindrucks vom Auge bis ins Gehirn?",
							answers: [
								{
									content: "Antwort A",
									isCorrect: false
								},
								{
									content: "Antwort B",
									isCorrect: false
								},
								{
									content: "Antwort C",
									isCorrect: false
								},
								{
									content: "Antwort D",
									isCorrect: true
								}
							],
							hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
						})
					]
				}
			),
			createLesson(
				{
					title: "Visueller Cortex",
					subtitle: "Aktivierungsfrage: Was ist der visuelle Cortex?",
					description: "**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 93ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
					content: [createVideo("https://www.youtube.com/watch?v=S59pR41htnw", 392)],
					questions: [
						createMultipleChoice({
							question: "Was ist der visuelle Cortex?",
							answers: [
								{
									content: "Antwort A",
									isCorrect: false
								},
								{
									content: "Antwort B",
									isCorrect: false
								},
								{
									content: "Antwort C",
									isCorrect: false
								},
								{
									content: "Antwort D",
									isCorrect: true
								}
							],
							hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
						})
					]
				}
			),
			createLesson(
				{
					title: "Organisation des Visuellen Cortex in Säulen",
					subtitle: "Aktivierungsfrage: Wie ist der visuelle Cortex organisiert?",
					description: "**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 96ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
					content: [createVideo("https://www.youtube.com/watch?v=S59pR41htnw", 392)],
					questions: [
						createMultipleChoice({
							question: "Wie ist der visuelle Cortex organisiert?",
							answers: [
								{
									content: "Antwort A",
									isCorrect: false
								},
								{
									content: "Antwort B",
									isCorrect: false
								},
								{
									content: "Antwort C",
									isCorrect: false
								},
								{
									content: "Antwort D",
									isCorrect: true
								}
							],
							hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
						})
					]
				}
			)
		]
	},
	{
		title: "Farbwahrnehmung",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				{
					title: "Modell des Farbraumes",
					subtitle: "Aktivierungsfrage: Wie funktioniert die additive und subtraktive Farbmischung?",
					description: "**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 100ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
					content: [createVideo("https://www.youtube.com/watch?v=gS011EazFQY", 393)],
					questions: [
						createMultipleChoice({
							question: "Wie funktioniert die additive und subtraktive Farbmischung?",
							answers: [
								{
									content: "Antwort A",
									isCorrect: false
								},
								{
									content: "Antwort B",
									isCorrect: false
								},
								{
									content: "Antwort C",
									isCorrect: false
								},
								{
									content: "Antwort D",
									isCorrect: true
								}
							],
							hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
						})
					]
				}
			),

			createLesson(
				{
					title: "Spektralfarben und Farbmischung",
					subtitle: "Aktivierungsfrage: Was ist weißes Licht?",
					description: "**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 101ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
					content: [createVideo("https://www.youtube.com/watch?v=Xh61j1exRown", 394)],
					questions: [
						createMultipleChoice({
							question: "Was ist weißes Licht?",
							answers: [
								{
									content: "Antwort A",
									isCorrect: false
								},
								{
									content: "Antwort B",
									isCorrect: false
								},
								{
									content: "Antwort C",
									isCorrect: false
								},
								{
									content: "Antwort D",
									isCorrect: true
								}
							],
							hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
						})
					]
				}
			),

			createLesson(
				{
					title: "Drei-Farben-Theorie von Young und Helmholtz",
					subtitle: "Aktivierungsfrage: Aus welchen Farben werden alle wahrgenommen Farbtöne laut Drei-Farben-Theorie zusammengesetzt?",
					description: "**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 101ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
					content: [createVideo("https://www.youtube.com/watch?v=rRr7RdCHtUI", 395)],
					questions: [
						createMultipleChoice({
							question:
								"Aus welchen Farben werden alle wahrgenommen Farbtöne laut Drei-Farben-Theorie zusammengesetzt?",
							answers: [
								{
									content: "Gelb - Grün - Blau",
									isCorrect: false
								},
								{
									content: "Blau - Grün - Gelb",
									isCorrect: false
								},
								{
									content: "Rot - Gelb - Blau",
									isCorrect: false
								},
								{
									content: "Blau - Rot - Grün",
									isCorrect: true
								}
							],
							hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
						})
					]
				}
			),

			createLesson(
				{
					title: "Gegenfarbentheorie (*opponent-process theory*) von Hering",
					subtitle: "Aktivierungsfrage: Was besagt die Gegenfarbentheorie?",
					description: "**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 103ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
					content: [createVideo("https://www.youtube.com/watch?v=rRr7RdCHtUI", 396)],
					questions: [
						createMultipleChoice({
							question:
								"Aus welchen Farben werden alle wahrgenommen Farbtöne laut Drei-Farben-Theorie zusammengesetzt?",
							answers: [
								{
									content: "Antwort A",
									isCorrect: false
								},
								{
									content: "Antwort B",
									isCorrect: false
								},
								{
									content: "Antwort C",
									isCorrect: false
								},
								{
									content: "Antwort D",
									isCorrect: true
								}
							],
							hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
						})
					]
				}
			),

			createLesson(
				"Physiologische Basis der Farbwahrnehmung und die Zweistufentheorie",
				"Aktivierungsfrage: Was besagt die Gegenfarbentheorie?",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 104ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=rRr7RdCHtUI", 397)],
				[
					createMultipleChoice({
						question:
							"Aus welchen Farben werden alle wahrgenommen Farbtöne laut Drei-Farben-Theorie zusammengesetzt?",
						answers: [
							{
								content: "Antwort A",
								isCorrect: false
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: false
							},
							{
								content: "Antwort D",
								isCorrect: true
							}
						],
						hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					})
				]
			);
];
},
{
	"Räumliche Tiefe und Objektgröße",
		description;
:
	"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content;
:
	[
		createLesson(
			"Monokulare Tiefenhinweise",
			"Aktivierungsfrage: Wie funktioniert Tiefenwahrnehmung und räumliches Sehen?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 105ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=l8fiFM3gnGg", 398)],
			[
				createMultipleChoice({
					question: "Wie funktioniert Tiefenwahrnehmung und räumliches Sehen?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),

		createLesson(
			"Binokulare Tiefenhinweise",
			"Aktivierungsfrage: Was versteht man unter Querdisparation?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 107ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=kKqQqNW2K0g", 399)],
			[
				createMultipleChoice({
					question: "Was versteht man unter Querdisparation?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),

		createLesson(
			"Zufallsstereogramme und binokulare Neurone",
			"Aktivierungsfrage zu. Zufallsstereogramme und binokulare Neurone",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 108ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=rRr7RdCHtUI", 400)],
			[
				createMultipleChoice({
					question: "Frage zu: Zufallsstereogramme und binokulare Neurone?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		)
	];
}
,
{
	"Wahrnehmungskonstanzen",
		description;
:
	"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content;
:
	[
		createLesson(
			"Helligkeitskonstanz",
			"Aktivierungsfrage zu: Helligkeitskonstanz",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 111ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=Jxh2a0el9kA", 401)],
			[
				createMultipleChoice({
					question: "Frage zu Helligkeitskonstanz?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),
		createLesson(
			"Farbkonstanz",
			"Aktivierungsfrage zu: Farbkonstanz?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 113ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=kKqQqNW2K0g", 402)],
			[
				createMultipleChoice({
					question: "Frage zu Farbkonstanz?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),

		createLesson(
			"Größenkonstanz",
			"Aktivierungsfrage zu: Größenkonstanz?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 108ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=rRr7RdCHtUI", 403)],
			[
				createMultipleChoice({
					question: "Frage zu: Größenkonstanz?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),
		createLesson(
			"Form- und Lokationskonstanz",
			"Aktivierungsfrage zu: Form- und Lokationskonstanz?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 108ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=rRr7RdCHtUI", 404)],
			[
				createMultipleChoice({
					question: "Frage zu: Form- und Lokationskonstanz?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		)
	];
}
,
{
	"Geometrisch-optische Täuschungen",
		description;
:
	"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content;
:
	[
		createLesson(
			"Ponzo-Täuschung",
			"Aktivierungsfrage zu: Ponzo-Täuschung",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 118ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=qdJ8ZT34wBk", 405)],
			[
				createMultipleChoice({
					question: "Frage zu Ponzo-Täuschung?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),
		createLesson(
			"Ames`sche Raum",
			"Aktivierungsfrage zu: Ames`sche Raum?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 120ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=hCV2Ba5wrcs", 406)],
			[
				createMultipleChoice({
					question: "Frage zu Ames`sche Raum?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),

		createLesson(
			"Müller-Lyer`sche Täuschung",
			"Aktivierungsfrage zu: Müller-Lyer`sche Täuschung?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 121ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=OCs_Ja4Xj8o", 407)],
			[
				createMultipleChoice({
					question: "Frage zu: Müller-Lyer`sche Täuschung?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),
		createLesson(
			"Zöllner`sche Täuschung",
			"Aktivierungsfrage zu: Zöllner`sche Täuschung?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 122ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=nYbK2DHVh5U", 408)],
			[
				createMultipleChoice({
					question: "Frage zu: Zöllner`sche Täuschung?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),

		createLesson(
			"Poggendorf`sche Täuschung",
			"Aktivierungsfrage zu: Poggendorf`sche Täuschung?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 122ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=nYbK2DHVh5U", 409)],
			[
				createMultipleChoice({
					question: "Frage zu: Poggendorf`sche Täuschung?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),
		createLesson(
			"Der wahrnehmungsökologische Ansatz",
			"Aktivierungsfrage zu: Der wahrnehmungsökologische Ansatz?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 123ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=rRr7RdCHtUI", 410)],
			[
				createMultipleChoice({
					question: "Frage zu: Der wahrnehmungsökologische Ansatz?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		)
	];
}
,
{
	"Organisationsprinzipien und Objekterkennen",
		description;
:
	"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content;
:
	[
		createLesson(
			"Figur-Grund-Trennung und Gestaltprinzipien",
			"Aktivierungsfrage: Welches Gestaltgesetz bewirkt, dass Sie hier (Bild einfügen) ein Rechteck und ein Dreieck sehen?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 124ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=qdJ8ZT34wBk", 411)],
			[
				createMultipleChoice({
					question:
						"Welches Gestaltgesetz bewirkt, dass Sie hier (Bild einfügen) ein Rechteck und ein Dreieck sehen?",
					answers: [
						{
							content: "Gesetz der Ähnlichkeit",
							isCorrect: false
						},
						{
							content: "Gesetz der Nähe",
							isCorrect: false
						},
						{
							content: "Gesetz der Prägnanz",
							isCorrect: true
						},
						{
							content: "Gesetz der guten Fortsetzung",
							isCorrect: false
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				}),

				createMultipleChoice({
					question:
						"Welche Organisationsprinzipien stecken hinter den sog. „Gestaltgesetzen“?",
					answers: [
						{
							content: "Gesetz der Prägnanz",
							isCorrect: true
						},
						{
							content: "Gesetz der Nähe",
							isCorrect: true
						},
						{
							content: "Gesetz der kleinsten Wirkung",
							isCorrect: false
						},
						{
							content: "Gesetz der Farbe",
							isCorrect: false
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),

		createLesson(
			"Perzept und Wahrnehmungserwartung",
			"Aktivierungsfrage zu: Perzept und Wahrnehmungserwartung?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 126ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=hCV2Ba5wrcs", 412)],
			[
				createMultipleChoice({
					question: "Frage zu Perzept und Wahrnehmungserwartung?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),

		createLesson(
			"Späte Prozesse der Objekterkennung",
			"Aktivierungsfrage zu: Späte Prozesse der Objekterkennung?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 130ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=OCs_Ja4Xj8o", 413)],
			[
				createMultipleChoice({
					question: "Frage zu: Späte Prozesse der Objekterkennung?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),

		createLesson(
			"Konnektionistische Netzwerke",
			"Aktivierungsfrage zu: Konnektionistische Netzwerke?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 131ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=nYbK2DHVh5U", 414)],
			[
				createMultipleChoice({
					question: "Frage zu: Konnektionistische Netzwerke?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),

		createLesson(
			"Erkennung natürlicher Objekte",
			"Aktivierungsfrage zu: Erkennung natürlicher Objekte?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 133ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=nYbK2DHVh5U", 415)],
			[
				createMultipleChoice({
					question: "Frage zu: Erkennung natürlicher Objekte?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		)
	];
}
,
{
	"Bewegungswahrnehmung",
		description;
:
	"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content;
:
	[
		createLesson(
			"Stroboskopische oder Scheinbewegung",
			"Aktivierungsfrage zu: Stroboskopische oder Scheinbewegung?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 137ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=qdJ8ZT34wBk", 416)],
			[
				createMultipleChoice({
					question: "Frage zu: Stroboskopische oder Scheinbewegung?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),

		createLesson(
			"Induzierte Bewegung",
			"Aktivierungsfrage zu: Induzierte Bewegung?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 138ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=hCV2Ba5wrcs", 417)],
			[
				createMultipleChoice({
					question: "Frage zu Induzierte Bewegung?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),

		createLesson(
			"Reale Bewegung",
			"Selbstregulierter Kurs zum Thema 'Reale Bewegung'",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 139ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=OCs_Ja4Xj8o", 418)],
			[
				createMultipleChoice({
					question: "Frage zu: Reale Bewegung?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				}),
				createMultipleChoice({
					question: "Zweite Frage zu: Reale Bewegung?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			],
			null, // licenseID
			LessonType.SELF_REGULATED,
			"Frage zu: Reale Bewegung?"
		)
	];
}
,
{
	"Wahrnehmungslernen",
		description;
:
	"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content;
:
	[
		createLesson(
			"Sensible Phasen der Wahrnehmungsentwicklung",
			"Aktivierungsfrage zu: Sensible Phasen der Wahrnehmungsentwicklung?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 144ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=qdJ8ZT34wBk", 419)],
			[
				createMultipleChoice({
					question: "Frage zu: Sensible Phasen der Wahrnehmungsentwicklung?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),

		createLesson(
			"Eigenbewegung als Bedingung der Tiefenwahrnehmung",
			"Aktivierungsfrage zu: Eigenbewegung als Bedingung der Tiefenwahrnehmung?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 148ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=hCV2Ba5wrcs", 420)],
			[
				createMultipleChoice({
					question: "Frage zu Eigenbewegung als Bedingung der Tiefenwahrnehmung?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		),

		createLesson(
			" Wahrnehmungs-Reaktions-Kopplungen (Auslösemechanismen)",
			"Aktivierungsfrage zu:  Wahrnehmungs-Reaktions-Kopplungen (Auslösemechanismen)?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 148ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=OCs_Ja4Xj8o", 421)],
			[
				createMultipleChoice({
					question:
						"Frage zu:  Wahrnehmungs-Reaktions-Kopplungen (Auslösemechanismen)?",
					answers: [
						{
							content: "Antwort A",
							isCorrect: false
						},
						{
							content: "Antwort B",
							isCorrect: false
						},
						{
							content: "Antwort C",
							isCorrect: false
						},
						{
							content: "Antwort D",
							isCorrect: true
						}
					],
					hints: ["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
				})
			]
		)
	];
}
]


export const course = createCourse(
	"psychologie",
	"wahrnehmung",
	"Das Wahrnehmungssystem zum Sehen",
	null,
	"Hierbei geht es um die biologischen und die neurophysiologischen/-anatomischen Grundlagen der Signalverarbeitung, den Spezifika und Prinzipien des Hörens sowie um Beispiele für die auditive Wahrnehmung.",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Auge.png/650px-Auge.png?20060121123626",
	chapters
);
