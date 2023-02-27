import {
	createCourse,
	createLesson,
	createVideo,
	createMultipleChoice,
	createTextQuestion
} from "../seed-functions";

export const chapters = [
	{
		title: "Gehör - das auditive System",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Aufbau und Funktion des Ohres",
				"Aktivierungsfrage: Welche der genannten anatomischen Strukturen im Innenohr dient dem Hören?",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://youtu.be/Hd0iTFkrQFs", 501)],
				[
					createTextQuestion(
						"Sequenzielle Fragen zu: Welche anatomischen Strukturen im Innenohr dienen dem Hören? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nBogengänge und Sacculus\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Welche anatomischen Strukturen im Innenohr dienen dem Hören? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nSchnecke und Cochlea\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Welche anatomischen Strukturen im Innenohr dienen dem Hören? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nSacculus und Cochlea\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Welche anatomischen Strukturen im Innenohr dienen dem Hören? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nBogengänge und Schnecke\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Welche der genannten anatomischen Strukturen im Innenohr dient dem Hören?",
						[
							{
								content: "Bogengänge und Sacculus",
								isCorrect: false
							},
							{
								content: "Schnecke und Cochlea",
								isCorrect: true
							},
							{
								content: "Sacculus und Cochlea",
								isCorrect: false
							},
							{
								content: "Bogengänge und Schnecke",
								isCorrect: false
							}
						],
						["Abgrenzung zum Gleichgewichtsorgan", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Psychophysische Grundlagen",
				"Aktivierungsfrage: Was sind die psychischen Dimensionen akustischer Reize?",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**W33 - 34führende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://youtu.be/ZuIv7v9zCKo", 502)],
				[
					createTextQuestion(
						"Sequenzielle Fragen zu: Was sind die psychischen Dimensionen akustischer Reize? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nLautstärke\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Was sind die psychischen Dimensionen akustischer Reize? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nTonhöhe und Klangfarbe\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Was sind die psychischen Dimensionen akustischer Reize? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nMaskierungseffekte und Störgeräusche\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Was sind die psychischen Dimensionen akustischer Reize? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nFrequenz und Druck\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Was sind die psychischen Dimensionen akustischer Reize?",
						[
							{
								content: "Lautstärke",
								isCorrect: true
							},
							{
								content: "Tonhöhe und Klangfarbe",
								isCorrect: true
							},
							{
								content: "Maskierungseffekte und Störgeräusche",
								isCorrect: true
							},
							{
								content: "Frequenz und Druck",
								isCorrect: false
							}
						],
						["Abgrenzung zur Physik", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Die Physik des Schalls",
				"Aktivierungsfrage: Was sind die physikalischen Merkmale von Schall?",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**W33 - 34führende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://youtu.be/ZuIv7v9zCKo", 503)],
				[
					createTextQuestion(
						"Sequenzielle Fragen zu: Was sind die physikalischen Merkmale von Schall? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nDruckschwankungen eines elastischen Mediums\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Was sind die physikalischen Merkmale von Schall? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nSchallintensität (*sound intensity*)\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Was sind die physikalischen Merkmale von Schall? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nSchalldruckpegel (*sound pressure level*)\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Was sind die physikalischen Merkmale von Schall? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nDas menschliche Gehör verfügt bzgl. der Schallintensitäten und -drücke über keinen sehr großen Dynamikbereich.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Was sind die physikalischen Merkmale von Schall?",
						[
							{
								content: "Druckschwankungen eines elastischen Mediums",
								isCorrect: true
							},
							{
								content: "Schallintensität (*sound intensity*)",
								isCorrect: true
							},
							{
								content: "Schalldruckpegel (*sound pressure level*)",
								isCorrect: true
							},
							{
								content:
									"Das menschliche Gehör verfügt bzgl. der Schallintensitäten und -drücke über keinen sehr großen Dynamikbereich.",
								isCorrect: false
							}
						],
						["Abgrenzung zu psychischen Dimensionen", "Hinweis 2", "Hinweis n"]
					),
					createTextQuestion(
						"Wovon ist die Hörschwelle abhängig?",
						["Schalldruck", "Schalldruckpegel", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					)
				]
			)
		]
	},
	{
		title: "Neuronale Verarbeitung der auditiven Reizinformation (Haarsinneszellen)",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Hörbahn und auditorischer Cortex",
				"Aktivierungsfrage zu Hörbahn und auditorischer Cortex",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 166ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.dasgehirn.info/wahrnehmen/hoeren/video-hoeren?language=en",
						504
					)
				],
				[
					createTextQuestion(
						"Sequenzielle Fragen zu: Hörbahn und auditorischer Cortex Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Hörbahn und auditorischer Cortex Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Hörbahn und auditorischer Cortex Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Hörbahn und auditorischer Cortex Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Hörbahn und auditorischer Cortex?",
						[
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
						["Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Hörtheorien - Periodizitätstheorie",
				"Aktivierungsfrage zu Hörtheorien - Periodizitätstheorie",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 168ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 505)],
				[
					createTextQuestion(
						"Sequenzielle Fragen zu: Hörtheorien - Periodizitätstheorie Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Hörtheorien - Periodizitätstheorie Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Hörtheorien - Periodizitätstheorie Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Hörtheorien - Periodizitätstheorie Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Hörtheorien - Periodizitätstheorie?",
						[
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
						["Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Auditive Raumwahrnehmung",
				"Aktivierungsfrage zu auditiver Raumwahrnehmung",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 169ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 506)],
				[
					createTextQuestion(
						"Sequenzielle Fragen zu: auditiver Raumwahrnehmung Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: auditiver Raumwahrnehmung Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: auditiver Raumwahrnehmung Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: auditiver Raumwahrnehmung Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu auditiver Raumwahrnehmung?",
						[
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
						["Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Auditive Wahrnehmungsorganisation",
				"Aktivierungsfrage zu auditiver Wahrnehmungsorganisation",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 507)],
				[
					createTextQuestion(
						"Sequenzielle Fragen zu: auditiver Wahrnehmungsorganisation Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: auditiver Wahrnehmungsorganisation Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: auditiver Wahrnehmungsorganisation Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: auditiver Wahrnehmungsorganisation Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu auditiver Wahrnehmungsorganisation?",
						[
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
						["Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			)
		]
	},
	{
		title: "Neuronale Verarbeitung der höheren Zentren des Hörens",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Corpus geniculatum mediale",
				"Aktivierungsfrage zu: Corpus geniculatum mediale?",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 167ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://praxistipps.focus.de/corpus-geniculatum-mediale-lage-und-funktion_124893",
						508
					)
				],
				[
					createTextQuestion(
						"Sequenzielle Fragen zu: Corpus geniculatum mediale Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Corpus geniculatum mediale Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Corpus geniculatum mediale Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Corpus geniculatum mediale Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Corpus geniculatum mediale?",
						[
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
						["Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Auditorischer Cortex",
				"Aktivierungsfrage zu: Auditorischer Cortex?",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 167ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 509)],
				[
					createTextQuestion(
						"Sequenzielle Fragen zu: Auditorischer Cortex Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Auditorischer Cortex Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Auditorischer Cortex Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Auditorischer Cortex Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Auditorischer Cortex?",
						[
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
						["Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			)
		]
	},
	{
		title: "Dimensionen auditiver Erfahrung",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Tonhöhe",
				"Aktivierungsfrage zu: Tonhöhe",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 510)],
				[
					createTextQuestion(
						"Sequenzielle Fragen zu: Tonhöhe Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Tonhöhe Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Tonhöhe Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Tonhöhe Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Tonhöhe?",
						[
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
						["Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Lautstärke",
				"Aktivierungsfrage zu: Lautstärke",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 511)],
				[
					createTextQuestion(
						"Sequenzielle Fragen zu: Lautstärke Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Lautstärke Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Lautstärke Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Lautstärke Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Lautstärke?",
						[
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
						["Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Klangfarbe",
				"Aktivierungsfrage zu: Klangfarbe",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 512)],
				[
					createTextQuestion(
						"Sequenzielle Fragen zu: Klangfarbe Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Klangfarbe Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Klangfarbe Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Klangfarbe Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Klangfarbe?",
						[
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
						["Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			)
		]
	},
	{
		title: "Beispiel für akustische Täuschungen",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Shepard Illusion",
				"Aktivierungsfrage zu: Shepard Illusion?",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 513)],
				[
					createTextQuestion(
						"Sequenzielle Fragen zu: Shepard Illusion Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Shepard Illusion Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Shepard Illusion Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: Shepard Illusion Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Shepard Illusion?",
						[
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
						["Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"McGurk-Effekt",
				"Aktivierungsfrage zu: McGurk-Effekt",
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 514)],
				[
					createTextQuestion(
						"Sequenzielle Fragen zu: McGurk-Effekt Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: McGurk-Effekt Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: McGurk-Effekt Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Fragen zu: McGurk-Effekt Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu McGurk-Effekt?",
						[
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
						["Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			)
		]
	}
];

export const course = createCourse(
	"psychologie",
	"wahrnehmung",
	"Das Wahrnehmungssystem zum Hören",
	null,
	"Hierbei geht es um die biologischen und die neurophysiologischen/-anatomischen Grundlagen der Signalverarbeitung, den Spezifika und Prinzipien des Hörens sowie um Beispiele für die auditive Wahrnehmung.",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/%C3%84u%C3%9Feres_Ohr_-_Mittelohr_-_Innenohr.jpg/769px-%C3%84u%C3%9Feres_Ohr_-_Mittelohr_-_Innenohr.jpg?20211029082610",
	chapters
);
