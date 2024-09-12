import {
	createCourse,
	createLesson,
	createMultipleChoice,
	createTextQuestion,
	createVideo
} from "../seed-functions";

export const chapters = [
	{
		title: "Gehör - das auditive System",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson({
				title: "Aufbau und Funktion des Ohres",
				subtitle:
					"Aktivierungsfrage: Welche der genannten anatomischen Strukturen im Innenohr dient dem Hören?",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://youtu.be/Hd0iTFkrQFs", 501)],
				questions: [
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
					createMultipleChoice({
						question:
							"Welche der genannten anatomischen Strukturen im Innenohr dient dem Hören?",
						answers: [
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
						hints: ["Abgrenzung zum Gleichgewichtsorgan", "Hinweis 2", "Hinweis n"]
					})
				]
			}),
			createLesson({
				title: "Psychophysische Grundlagen",
				subtitle:
					"Aktivierungsfrage: Was sind die psychischen Dimensionen akustischer Reize?",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**W33 - 34führende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://youtu.be/ZuIv7v9zCKo", 502)],
				questions: [
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
					createMultipleChoice({
						question: "Was sind die psychischen Dimensionen akustischer Reize?",
						answers: [
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
						hints: ["Abgrenzung zur Physik", "Hinweis 2", "Hinweis n"]
					})
				]
			}),
			createLesson({
				title: "Die Physik des Schalls",
				subtitle: "Aktivierungsfrage: Was sind die physikalischen Merkmale von Schall?",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**W33 - 34führende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://youtu.be/ZuIv7v9zCKo", 503)],
				questions: [
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
					createMultipleChoice({
						question: "Was sind die physikalischen Merkmale von Schall?",
						answers: [
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
						hints: ["Abgrenzung zu psychischen Dimensionen", "Hinweis 2", "Hinweis n"]
					}),
					createTextQuestion(
						"Wovon ist die Hörschwelle abhängig?",
						["Schalldruck", "Schalldruckpegel", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					)
				]
			})
		]
	},
	{
		title: "Neuronale Verarbeitung der auditiven Reizinformation (Haarsinneszellen)",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson({
				title: "Hörbahn und auditorischer Cortex",
				subtitle: "Aktivierungsfrage zu Hörbahn und auditorischer Cortex",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 166ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [
					createVideo(
						"https://www.dasgehirn.info/wahrnehmen/hoeren/video-hoeren?language=en",
						504
					)
				],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Hörbahn und auditorischer Cortex?",
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
						hints: ["Hinweis 1", "Hinweis 2", "Hinweis n"]
					})
				]
			}),
			createLesson({
				title: "Hörtheorien - Periodizitätstheorie",
				subtitle: "Aktivierungsfrage zu Hörtheorien - Periodizitätstheorie",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 168ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 505)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Hörtheorien - Periodizitätstheorie?",
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
						hints: ["Hinweis 1", "Hinweis 2", "Hinweis n"]
					})
				]
			}),
			createLesson({
				title: "Auditive Raumwahrnehmung",
				subtitle: "Aktivierungsfrage zu auditiver Raumwahrnehmung",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 169ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 506)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu auditiver Raumwahrnehmung?",
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
						hints: ["Hinweis 1", "Hinweis 2", "Hinweis n"]
					})
				]
			}),
			createLesson({
				title: "Auditive Wahrnehmungsorganisation",
				subtitle: "Aktivierungsfrage zu auditiver Wahrnehmungsorganisation",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 507)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu auditiver Wahrnehmungsorganisation?",
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
						hints: ["Hinweis 1", "Hinweis 2", "Hinweis n"]
					})
				]
			})
		]
	},
	{
		title: "Neuronale Verarbeitung der höheren Zentren des Hörens",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson({
				title: "Corpus geniculatum mediale",
				subtitle: "Aktivierungsfrage zu: Corpus geniculatum mediale?",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 167ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [
					createVideo(
						"https://praxistipps.focus.de/corpus-geniculatum-mediale-lage-und-funktion_124893",
						508
					)
				],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Corpus geniculatum mediale?",
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
						hints: ["Hinweis 1", "Hinweis 2", "Hinweis n"]
					})
				]
			}),
			createLesson({
				title: "Auditorischer Cortex",
				subtitle: "Aktivierungsfrage zu: Auditorischer Cortex?",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 167ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 509)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Auditorischer Cortex?",
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
						hints: ["Hinweis 1", "Hinweis 2", "Hinweis n"]
					})
				]
			})
		]
	},
	{
		title: "Dimensionen auditiver Erfahrung",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson({
				title: "Tonhöhe",
				subtitle: "Aktivierungsfrage zu: Tonhöhe",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 510)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Tonhöhe?",
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
						hints: ["Hinweis 1", "Hinweis 2", "Hinweis n"]
					})
				]
			}),
			createLesson({
				title: "Lautstärke",
				subtitle: "Aktivierungsfrage zu: Lautstärke",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 511)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Lautstärke?",
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
						hints: ["Hinweis 1", "Hinweis 2", "Hinweis n"]
					})
				]
			}),
			createLesson({
				title: "Klangfarbe",
				subtitle: "Aktivierungsfrage zu: Klangfarbe",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 512)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Klangfarbe?",
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
						hints: ["Hinweis 1", "Hinweis 2", "Hinweis n"]
					})
				]
			})
		]
	},
	{
		title: "Beispiel für akustische Täuschungen",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson({
				title: "Shepard Illusion",
				subtitle: "Aktivierungsfrage zu: Shepard Illusion?",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 513)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Shepard Illusion?",
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
						hints: ["Hinweis 1", "Hinweis 2", "Hinweis n"]
					})
				]
			}),
			createLesson({
				title: "McGurk-Effekt",
				subtitle: "Aktivierungsfrage zu: McGurk-Effekt",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 157ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 514)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu McGurk-Effekt?",
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
						hints: ["Hinweis 1", "Hinweis 2", "Hinweis n"]
					})
				]
			})
		]
	}
];

export const course = createCourse({
	subjectId: "psychologie",
	specializationId: "wahrnehmung",
	title: "Das Wahrnehmungssystem zum Hören",
	description:
		"Hierbei geht es um die biologischen und die neurophysiologischen/-anatomischen Grundlagen der Signalverarbeitung, den Spezifika und Prinzipien des Hörens sowie um Beispiele für die auditive Wahrnehmung.",
	imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/%C3%84u%C3%9Feres_Ohr_-_Mittelohr_-_Innenohr.jpg/769px-%C3%84u%C3%9Feres_Ohr_-_Mittelohr_-_Innenohr.jpg?20211029082610",
	chapters
});
