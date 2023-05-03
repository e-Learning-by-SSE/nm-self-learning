import {
	createCourse,
	createLesson,
	createMultipleChoice,
	createTextQuestion,
	createVideo
} from "../seed-functions";
// const courses = [
// 	createCourse(
// 		subjectRouter
// 		specializationId: "3",
// 		subjectId: "3",
// 		slug: "aufmerksamkeit",
// 		title: "Aufmerksamkeit",
// 		subtitle: "Bei der **Aufmerksamkeit** geht es darum die psychologische Definition von einem alltagspsychologischen Verständnis abzugrenzen. Dabei sollen die verschiedenen Funktionen von Aufmerksamkeit erläutert werden und mit Hilfe welcher Experimente die Aufmerksamkeitsphänomene erforscht werden können. ",
// 		"##Die Studierenden sind in der Lage ... \r\n*die verschiedenen Funktionen von Aufmerksamkeit zu verstehen; \r\n*Experimente zur Erforschung von Aufmerksamkeitsphänomenen zu kennen und nachzuvollziehen und Replikationen mit Hilfestellung selbst durchzuführen; \r\n*Theorien zu Aufmerksamkeit zu verstehen und zu vergleichen.\r\n\r\nEs werden keine Grundkenntnisse vorausgesetzt",
// 		cardImgUrl: "https://pixnio.com/de/media/verkehrssteuerung-stau-verkehr-sicherheit-vorsicht",
// 		imgUrlBanner: "https://pixnio.com/de/media/verkehrssteuerung-stau-verkehr-sicherheit-vorsicht"
// 	chapters
// 	)
// ];

export const chapters = [
	{
		title: "Aufmerksamkeit (*attention*)",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Definition von Aufmerksamkeit",
				"Aktivierungsfrage: Wie wird Aufmerksamkeit definiert?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage: Wie wird Aufmerksamkeit definiert? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAufmerksamkeit ist die Fähigkeit, bestimmte Informationen für eine genauere Analyse auszuwählen und andere zu ignorieren.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Wie wird Aufmerksamkeit definiert? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAufmerksamkeit ist die Zuteilung kognitiver Ressourcen zu laufenden Prozessen.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Wie wird Aufmerksamkeit definiert? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Wie wird Aufmerksamkeit definiert? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Wie wird Aufmerksamkeit definiert?",
						[
							{
								content:
									"Aufmerksamkeit ist die Fähigkeit, bestimmte Informationen für eine genauere Analyse auszuwählen und andere zu ignorieren.",
								isCorrect: true
							},
							{
								content:
									"Aufmerksamkeit ist die Zuteilung kognitiver Ressourcen zu laufenden Prozessen.",
								isCorrect: true
							},
							{
								content: "Antwort C",
								isCorrect: false
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Cocktailparty Phänomen (Cherry, 1953)",
				"Aktivierungsfrage zu Cocktailparty Phänomen (Cherry, 1953)?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage: Sie sind auf einer Party und unterhalten sich angeregt mit einer Freundin. Um Sie herum läuft laute Musik und es herrscht ein Stimmenwirrwarr. Plötzlich hören Sie ihren Namen vom anderen Ende des Raumes. Sie reagieren sofort. Wie heißt dieses Phänomen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nDinner-Party Phänomen\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Sie sind auf einer Party und unterhalten sich angeregt mit einer Freundin. Um Sie herum läuft laute Musik und es herrscht ein Stimmenwirrwarr. Plötzlich hören Sie ihren Namen vom anderen Ende des Raumes. Sie reagieren sofort. Wie heißt dieses Phänomen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nCocktail-Party Phänomen\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Sie sind auf einer Party und unterhalten sich angeregt mit einer Freundin. Um Sie herum läuft laute Musik und es herrscht ein Stimmenwirrwarr. Plötzlich hören Sie ihren Namen vom anderen Ende des Raumes. Sie reagieren sofort. Wie heißt dieses Phänomen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nDisco-Party Phänomen\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Sie sind auf einer Party und unterhalten sich angeregt mit einer Freundin. Um Sie herum läuft laute Musik und es herrscht ein Stimmenwirrwarr. Plötzlich hören Sie ihren Namen vom anderen Ende des Raumes. Sie reagieren sofort. Wie heißt dieses Phänomen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nDance-Party Phänomen\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Sie sind auf einer Party und unterhalten sich angeregt mit einer Freundin. Um Sie herum läuft laute Musik und es herrscht ein Stimmenwirrwarr. Plötzlich hören Sie ihren Namen vom anderen Ende des Raumes. Sie reagieren sofort. Wie heißt dieses Phänomen?",
						[
							{
								content: "Dinner-Party Phänomen",
								isCorrect: false
							},
							{
								content: "Cocktail-Party Phänomen",
								isCorrect: true
							},
							{
								content: "Disco-Party Phänomen",
								isCorrect: false
							},
							{
								content: "Dance-Party Phänomen",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Serieller Flaschenhals (*serial bottleneck*) (Chun & Potter, 1995)",
				"Aktivierungsfrage: Welches Phänomen beschreibt der serielle Flaschenhals??",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage: Welches Phänomen beschreibt der serielle Flaschenhals? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nDas Phänomen beschreibt einen zentralen Verarbeitungsengpass, der entsteht, weil bestimmte zentrale Verarbeitungsprozesse eine nicht zwischen Aufgaben aufteilbare Ressource darstellen und damit eine Serialisierung der Verarbeitung bedingen, wenn sie von verschiedenen Aufgaben zur selben Zeit benötigt werden.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Welches Phänomen beschreibt der serielle Flaschenhals? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Welches Phänomen beschreibt der serielle Flaschenhals? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Welches Phänomen beschreibt der serielle Flaschenhals? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Welches Phänomen beschreibt der serielle Flaschenhals?",
						[
							{
								content:
									"Das Phänomen beschreibt einen zentralen Verarbeitungsengpass, der entsteht, weil bestimmte zentrale Verarbeitungsprozesse eine nicht zwischen Aufgaben aufteilbare Ressource darstellen und damit eine Serialisierung der Verarbeitung bedingen, wenn sie von verschiedenen Aufgaben zur selben Zeit benötigt werden.",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: true
							},
							{
								content: "Antwort C",
								isCorrect: false
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			)
		]
	},
	{
		title: "Selektive Reizverarbeitung",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Selektive Aufmerksamkeit",
				"Aktivierungsfrage zu selektiver Aufmerksamkeit",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu selektiver Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu selektiver Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu selektiver Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu selektiver Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu selektiver Aufmerksamkeit ?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: true
							},
							{
								content: "Antwort C",
								isCorrect: false
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Klassische Ansätze zur selektiven Aufmerksamkeit",
				"Aktivierungsfrage zu klassischen Ansätzen selektiver Aufmerksamkeit",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu klassischen Ansätzen der selektiven Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu klassischen Ansätzen der selektiven Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu klassischen Ansätzen der selektiven Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu klassischen Ansätzen der selektiven Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu klassischen Ansätzen der selektiven Aufmerksamkeit ?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: true
							},
							{
								content: "Antwort C",
								isCorrect: false
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Selektive visuelle Aufmerksamkeit",
				"Aktivierungsfrage: Was besagt die Spotlight-Metapher?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage: Was besagt die Spotlight-Metapher? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nDas die visuelle Aufmerksamkeit auf wenige Grad des visuellen Feldes fokussiert wird.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was besagt die Spotlight-Metapher? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was besagt die Spotlight-Metapher? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was besagt die Spotlight-Metapher? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Was besagt die Spotlight-Metapher?",
						[
							{
								content:
									"Das die visuelle Aufmerksamkeit auf wenige Grad des visuellen Feldes fokussiert wird.",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: true
							},
							{
								content: "Antwort C",
								isCorrect: false
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Visuelle Suche",
				"Aktivierungsfrage zur visuellen Suche",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zur visuellen Suche? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zur visuellen Suche? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zur visuellen Suche? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zur visuellen Suche? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zur visuellen Suche?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: true
							},
							{
								content: "Antwort C",
								isCorrect: false
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Begrenzungen der selektiven visuellen Aufmerksamkeit",
				"Aktivierungsfrage zu Begrenzungen der selektiven visuellen Aufmerksamkeit",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Begrenzungen der selektiven visuellen Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Begrenzungen der selektiven visuellen Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Begrenzungen der selektiven visuellen Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Begrenzungen der selektiven visuellen Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Begrenzungen der selektiven visuellen Aufmerksamkeit?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: true
							},
							{
								content: "Antwort C",
								isCorrect: false
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Neurokognitive Mechanismen der selektiven visuellen Aufmerksamkeit",
				"Aktivierungsfrage zu neurokognitiven Mechanismen der selektiven visuellen Aufmerksamkeit",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu neurokognitiven Mechanismen der selektiven visuellen Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu neurokognitiven Mechanismen der selektiven visuellen Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu neurokognitiven Mechanismen der selektiven visuellen Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu neurokognitiven Mechanismen der selektiven visuellen Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu neurokognitiven Mechanismen der selektiven visuellen Aufmerksamkeit?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: true
							},
							{
								content: "Antwort C",
								isCorrect: false
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Dichotisches Hören und Filtertheorien",
				"Aktivierungsfrage: Was beschreibt das Paradigma zum dichotischen Hören?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt das Paradigma zum dichotischen Hören? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nExperimentelle Vorgehensweise, bei der dem Probanden (unterschiedliche) Nachrichten auf dem linken bzw. rechten Ohr zugespielt werden. Nur die auf einem Ohr ankommende Information ist dabei zu „beschatten“ (d.h. nachzusprechen „shadowing“). Von Interesse ist, welche (Art von) Informationen (physikalisch, semantisch) über das nicht „beschattete“ Ohr wahrgenommen wird.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt das Paradigma zum dichotischen Hören? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt das Paradigma zum dichotischen Hören? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt das Paradigma zum dichotischen Hören? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Was beschreibt das Paradigma zum dichotischen Hören?",
						[
							{
								content:
									"Experimentelle Vorgehensweise, bei der dem Probanden (unterschiedliche) Nachrichten auf dem linken bzw. rechten Ohr zugespielt werden. Nur die auf einem Ohr ankommende Information ist dabei zu „beschatten“ (d.h. nachzusprechen „shadowing“). Von Interesse ist, welche (Art von) Informationen (physikalisch, semantisch) über das nicht „beschattete“ Ohr wahrgenommen wird.",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: true
							},
							{
								content: "Antwort C",
								isCorrect: false
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was ist die Grundannahme der Filtertheorie von Broadbent (1958)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAufgabenrelevante Informationen werden schon früh selektiert.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was ist die Grundannahme der Filtertheorie von Broadbent (1958)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nEs ist die Aufgabe des Filters, ein Verarbeitungssystem vor Überlastung zu schützen.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was ist die Grundannahme der Filtertheorie von Broadbent (1958)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nZwei simultane Eingangsreize werden seriell verarbeitet.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was ist die Grundannahme der Filtertheorie von Broadbent (1958)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nBesonders auffällige Reize werden immer wahrgenommen.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Was ist die Grundannahme der Filtertheorie von Broadbent (1958)?",
						[
							{
								content:
									"Aufgabenrelevante Informationen werden schon früh selektiert.",
								isCorrect: true
							},
							{
								content:
									"Es ist die Aufgabe des Filters, ein Verarbeitungssystem vor Überlastung zu schützen.",
								isCorrect: true
							},
							{
								content: "Zwei simultane Eingangsreize werden seriell verarbeitet.",
								isCorrect: true
							},
							{
								content: "Besonders auffällige Reize werden immer wahrgenommen.",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Welche alternative Erklärung zur Filtertheorie bieten Deutsch und Deutsch (1963) an? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nTheorie der späten Auswahl\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Welche alternative Erklärung zur Filtertheorie bieten Deutsch und Deutsch (1963) an? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Welche alternative Erklärung zur Filtertheorie bieten Deutsch und Deutsch (1963) an? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Welche alternative Erklärung zur Filtertheorie bieten Deutsch und Deutsch (1963) an? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Welche alternative Erklärung zur Filtertheorie bieten Deutsch und Deutsch (1963) an?",
						[
							{
								content: "Theorie der späten Auswahl",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Attenuationstheorie (Treisman, 1964)",
				"Aktivierungsfrage: Worin besteht Treismans (1964) Modifikation des Broadbent-Modells?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage: Worin besteht Treismans (1964) Modifikation des Broadbent-Modells? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nDämpfungstheorie\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Worin besteht Treismans (1964) Modifikation des Broadbent-Modells? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Worin besteht Treismans (1964) Modifikation des Broadbent-Modells? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Worin besteht Treismans (1964) Modifikation des Broadbent-Modells? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Worin besteht Treismans (1964) Modifikation des Broadbent-Modells?",
						[
							{
								content: "Dämpfungstheorie",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Determinanten der Reizauswahl",
				"Aktivierungsfrage zu Determinanten der Reizauswahl?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Determinanten der Reizauswahl? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Determinanten der Reizauswahl? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Determinanten der Reizauswahl? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Determinanten der Reizauswahl? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Determinanten der Reizauswahl?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Temporale Mechanismen der selektiven Aufmerksamkeit",
				"Aktivierungsfrage zu temporale Mechanismen der selektiven Aufmerksamkeit?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu temporale Mechanismen der selektiven Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu temporale Mechanismen der selektiven Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu temporale Mechanismen der selektiven Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu temporale Mechanismen der selektiven Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu temporale Mechanismen der selektiven Aufmerksamkeit?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Aufmerksamkeitsausrichtung - top-down versus bottom-up",
				"Aktivierungsfrage zu Aufmerksamkeitsausrichtung - top-down versus bottom-up?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeitsausrichtung - top-down versus bottom-up? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeitsausrichtung - top-down versus bottom-up? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeitsausrichtung - top-down versus bottom-up? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeitsausrichtung - top-down versus bottom-up? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Aufmerksamkeitsausrichtung - top-down versus bottom-up?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Selektivität durch Bedürfnisse, Werte und Bewertungen",
				"Aktivierungsfrage zu Selektivität durch Bedürfnisse, Werte und Bewertungen?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Selektivität durch Bedürfnisse, Werte und Bewertungen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Selektivität durch Bedürfnisse, Werte und Bewertungen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Selektivität durch Bedürfnisse, Werte und Bewertungen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Selektivität durch Bedürfnisse, Werte und Bewertungen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Selektivität durch Bedürfnisse, Werte und Bewertungen?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Theorie der visuellen Aufmerksamkeit - Kategorisierung",
				"Aktivierungsfrage zur Theorie der visuellen Aufmerksamkeit - Kategorisierung?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zur Theorie der visuellen Aufmerksamkeit - Kategorisierung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zur Theorie der visuellen Aufmerksamkeit - Kategorisierung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zur Theorie der visuellen Aufmerksamkeit - Kategorisierung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zur Theorie der visuellen Aufmerksamkeit - Kategorisierung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zur Theorie der visuellen Aufmerksamkeit - Kategorisierung?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Physiologische Korrelate der Aufmerksamkeit",
				"Aktivierungsfrage zu physiologischen Korrelaten der Aufmerksamkeit?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle zu physiologischen Korrelaten der Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle zu physiologischen Korrelaten der Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu physiologischen Korrelaten der Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu physiologischen Korrelaten der Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu physiologischen Korrelaten der Aufmerksamkeit?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			)
		]
	},
	{
		title: "Aufmerksamkeit und Performanz",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Aufgabenkombinationen und geteilte Aufmerksamkeit",
				"Aktivierungsfrage zu Aufgabenkombinationen und geteilte Aufmerksamkeit?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Aufgabenkombinationen und geteilte Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufgabenkombinationen und geteilte Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufgabenkombinationen und geteilte Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufgabenkombinationen und geteilte Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Aufgabenkombinationen und geteilte Aufmerksamkeit?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: true
							},
							{
								content: "Antwort C",
								isCorrect: false
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Automatische Verarbeitung",
				"Aktivierungsfrage zur automatischen Verarbeitung?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zur automatischen Verarbeitung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zur automatischen Verarbeitung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zur automatischen Verarbeitung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zur automatischen Verarbeitung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zur automatischen Verarbeitung?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				'Aufmerksamkeit und "Umschalten zwischen Aufgaben" - der Stroop-Effekt',
				'Aktivierungsfrage zu Aufmerksamkeit und "Umschalten zwischen Aufgaben" - der Stroop-Effekt?',
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						'Sequenzielle Frage zu Aufmerksamkeit und "Umschalten zwischen Aufgaben" - der Stroop-Effekt? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n',
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						'Sequenzielle Frage zu Aufmerksamkeit und "Umschalten zwischen Aufgaben" - der Stroop-Effekt? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n',
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						'Sequenzielle Frage zu Aufmerksamkeit und "Umschalten zwischen Aufgaben" - der Stroop-Effekt? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n',
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						'Sequenzielle Frage zu Aufmerksamkeit und "Umschalten zwischen Aufgaben" - der Stroop-Effekt? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n',
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						'Frage zu Aufmerksamkeit und "Umschalten zwischen Aufgaben" - der Stroop-Effekt?',
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Mustererkennung und Aufmerksamkeit",
				"Aktivierungsfrage zu Mustererkennung und Aufmerksamkeit?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Mustererkennung und Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Mustererkennung und Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Mustererkennung und Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Mustererkennung und Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Mustererkennung und Aufmerksamkeit?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Neglect des visuellen Feldes",
				"Aktivierungsfrage zu Neglect des visuellen Feldes?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Neglect des visuellen Feldes? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Neglect des visuellen Feldes? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Neglect des visuellen Feldes? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Neglect des visuellen Feldes? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Neglect des visuellen Feldes?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Objektzentrierte Aufmerksamkeit",
				"Aktivierungsfrage zu objektzentrierter Aufmerksamkeit?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu objektzentrierter Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu objektzentrierter Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu objektzentrierter Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu objektzentrierter Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu objektzentrierter Aufmerksamkeit?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Aufmerksamkeitsphänomen - *Inhibition of Return*",
				"Aktivierungsfrage zu Aufmerksamkeitsphänomen - *Inhibition of Return*?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeitsphänomen - *Inhibition of Return*? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeitsphänomen - *Inhibition of Return*? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeitsphänomen - *Inhibition of Return*? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeitsphänomen - *Inhibition of Return*? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Aufmerksamkeitsphänomen - *Inhibition of Return*?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Aufmerksamkeitsphänomen - *Change Blindness* (Veränderungsblindheit)",
				"Aktivierungsfrage zu Aufmerksamkeitsphänomen - *Change Blindness* (Veränderungsblindheit)?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeitsphänomen - *Change Blindness* (Veränderungsblindheit)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeitsphänomen - *Change Blindness* (Veränderungsblindheit)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeitsphänomen - *Change Blindness* (Veränderungsblindheit)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeitsphänomen - *Change Blindness* (Veränderungsblindheit)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Aufmerksamkeitsphänomen - *Change Blindness* (Veränderungsblindheit)?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Aufmerksamkeit, Handlungssteuerung und kognitive Kontrolle",
				"Aktivierungsfrage zu Aufmerksamkeit, Handlungssteuerung und kognitive Kontrolle?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 198ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeit, Handlungssteuerung und kognitive Kontrolle? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeit, Handlungssteuerung und kognitive Kontrolle? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeit, Handlungssteuerung und kognitive Kontrolle? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Aufmerksamkeit, Handlungssteuerung und kognitive Kontrolle? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Aufmerksamkeit, Handlungssteuerung und kognitive Kontrolle?",
						[
							{
								content: "Antwort A",
								isCorrect: true
							},
							{
								content: "Antwort B",
								isCorrect: false
							},
							{
								content: "Antwort C",
								isCorrect: true
							},
							{
								content: "Antwort D",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			)
		]
	}
];

export const course = createCourse(
	//"3",
	//"3",
	"psychologie",
	"aufmerksamkeit",
	"Aufmerksamkeit",
	null,
	"Bei der **Aufmerksamkeit** geht es darum die psychologische Definition von einem alltagspsychologischen Verständnis abzugrenzen. Dabei sollen die verschiedenen Funktionen von Aufmerksamkeit erläutert werden und mit Hilfe welcher Experimente die Aufmerksamkeitsphänomene erforscht werden können. \n## Die Studierenden sind in der Lage ... \r\n* die verschiedenen Funktionen von Aufmerksamkeit zu verstehen; \r\n* Experimente zur Erforschung von Aufmerksamkeitsphänomenen zu kennen und nachzuvollziehen und Replikationen mit Hilfestellung selbst durchzuführen; \r\n* Theorien zu Aufmerksamkeit zu verstehen und zu vergleichen.\r\n\r\n Es werden keine Grundkenntnisse vorausgesetzt",
	"https://pixnio.com/free-images/2019/06/08/2019-06-08-09-44-18-1200x800.jpg",
	chapters
);
