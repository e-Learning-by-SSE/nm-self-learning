import { createCourse, createLesson, createMultipleChoice, createTextQuestion, createVideo } from "../seed-functions";

export const chapters =
	[
		{
			title: "Geschmack - das gustatorische System",
			description: "Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
			content:
				[
					createLesson(
						"Aufbau und Funktion der Zunge",
						"Aktivierungsfrage: Was ist der Ausgangspunkt der Geschmackswahrnehmung?",
						"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
						[
							createVideo(
								"https://www.youtube.com/watch?v=nIA5Fy2RljU", 450)],
						[
							createTextQuestion(
								"Sequenzielle Frage: Was ist der Ausgangspunkt der Geschmackswahrnehmung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Frage: Was ist der Ausgangspunkt der Geschmackswahrnehmung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Frage Was ist der Ausgangspunkt der Geschmackswahrnehmung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Frage: Was ist der Ausgangspunkt der Geschmackswahrnehmung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createMultipleChoice(
								"Was ist der Ausgangspunkt der Geschmackswahrnehmung?",
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
										isCorrect: false
									},
									{
										content: "Antwort D",
										isCorrect: false
									}
								],
								["Hinweis 1", "Hinweis 2", "Hinweis n"]
							),
						],
					),
					createLesson(
						"Spezifika des Schmeckens",
						"Aktivierungsfrage: Welche unterschiedlichen Geschmacksempfindungen gibt es?",
						"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**W33 - 34führende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
						[
							createVideo(
								"https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
						[
							createTextQuestion(
								"Sequenzielle Frage: Welche unterschiedlichen Geschmacksempfindungen gibt es? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsüß und salzig\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Frage: Welche unterschiedlichen Geschmacksempfindungen gibt es? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nbitter und sauer\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Frage: Welche unterschiedlichen Geschmacksempfindungen gibt es? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\numami\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Frage: Welche unterschiedlichen Geschmacksempfindungen gibt es? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\ndeftig und scharf\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createMultipleChoice(
								"Welche unterschiedlichen Geschmacksempfindungen gibt es?",
								[
									{
										content: "süß und salzig",
										isCorrect: true
									},
									{
										content: "bitter und sauer",
										isCorrect: true
									},
									{
										content: "umami",
										isCorrect: true
									},
									{
										content: "deftig und scharf",
										isCorrect: false
									}
								],
								["Hinweis 1", "Hinweis 2", "Hinweis n"]
							)
						]
					)
				]
		},
		{
			title: "Neuronale Verarbeitung der gustatorischen Reizinformation (Geruchsrezeptoren)",
			description: "Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
			content:
				[
					createLesson(
						"Gustatorik und Gedächtnis",
						"Aktivierungsfrage zu Gustatorik und Gedächtnis ",
						"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
						[
							createVideo(
								"https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
						[
							createTextQuestion(
								"Sequenzielle Fragen zu: Gustatorik und Gedächtnis Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Gustatorik und Gedächtnis Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Gustatorik und Gedächtnis Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Gustatorik und Gedächtnis Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createMultipleChoice(
								"Frage zu Gustatorik und Gedächtnis?",
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
						"Besonderheiten der neuronalen Verschaltung beim Schmecken",
						"Aktivierungsfrage zur neuronalen Verschaltung beim Schmecken",
						"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
						[
							createVideo(
								"https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
						[
							createTextQuestion(
								"Sequenzielle Fragen zur neuronalen Verschaltung beim Schmecken Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zur neuronalen Verschaltung beim Schmecken Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zur neuronalen Verschaltung beim Schmecken Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zur neuronalen Verschaltung beim Schmecken Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createMultipleChoice(
								"Frage zur neuronalen Verschaltung beim Schmecken?",
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
			title: "Neuronale Verarbeitung der höheren Zentren des Schmeckens",
			description: "Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
			content:
				[
					createLesson(
						"Nucleus Tractus Solitarii",
						"Aktivierungsfrage zu: Nucleus Tractus Solitarii?",
						"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
						[
							createVideo(
								"https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
						[
							createTextQuestion(
								"Sequenzielle Fragen zu: Nucleus Tractus Solitarii Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Nucleus Tractus Solitarii Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Nucleus Tractus Solitarii Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Nucleus Tractus Solitarii Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createMultipleChoice(
								"Frage zu Nucleus Tractus Solitarii?",
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
						],
					),
					createLesson(
						"Gustatorischer Cortex ",
						"Aktivierungsfrage zu: Gustatorischer Cortex?",
						"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
						[
							createVideo(
								"https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
						[
							createTextQuestion(
								"Sequenzielle Fragen zu: Gustatorischer Cortex Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Gustatorischer Cortex Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Gustatorischer Cortex Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Gustatorischer Cortex Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createMultipleChoice(
								"Frage zu Gustatorischer Cortex?",
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
			title: "Prinzipien der gustatorischen Wahrnehmung",
			description: "Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
			content:
				[
					createLesson(
						"Prinzipien der gustatorischen Wahrnehmung - Textur",
						"Aktivierungsfrage zu: Prinzipien der gustatorischen Wahrnehmung - Textur",
						"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
						[
							createVideo(
								"https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
						[
							createTextQuestion(
								"Sequenzielle Fragen zu: Prinzipien der gustatorischen Wahrnehmung - Textur Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Prinzipien der gustatorischen Wahrnehmung - Textur Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Prinzipien der gustatorischen Wahrnehmung - Textur Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Prinzipien der gustatorischen Wahrnehmung - Textur Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createMultipleChoice(
								"Frage zu Prinzipien der gustatorischen Wahrnehmung - Textur?",
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
						"Prinzipien der gustatorischen Wahrnehmung - Geräusche",
						"Aktivierungsfrage zu: Prinzipien der gustatorischen Wahrnehmung - Geräusche",
						"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
						[
							createVideo(
								"https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
						[
							createTextQuestion(
								"Sequenzielle Fragen zu: Prinzipien der gustatorischen Wahrnehmung - Geräusche Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Prinzipien der gustatorischen Wahrnehmung - Geräusche Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Prinzipien der gustatorischen Wahrnehmung - Geräusche Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Prinzipien der gustatorischen Wahrnehmung - Geräusche Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createMultipleChoice(
								"Frage zu Prinzipien der gustatorischen Wahrnehmung - Geräusche?",
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
			title: "Zusammenhänge und Beispiele",
			description: "Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
			content:
				[
					createLesson(
						" Zusammenhang zwischen Gustatorik und Hunger/Appetit ",
						"Aktivierungsfrage zu: Zusammenhang zwischen Gustatorik und Hunger/Appetit?",
						"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
						[
							createVideo(
								"https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
						[
							createTextQuestion(
								"Sequenzielle Fragen zu: Zusammenhang zwischen Gustatorik und Hunger/Appetit Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Zusammenhang zwischen Gustatorik und Hunger/Appetit Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Zusammenhang zwischen Gustatorik und Hunger/Appetit Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Zusammenhang zwischen Gustatorik und Hunger/Appetit Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createMultipleChoice(
								"Frage zu Zusammenhang zwischen Gustatorik und Hunger/Appetit?",
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
						"Zusammenhang zwischen Schmecken und Sehen",
						"Aktivierungsfrage zu: Zusammenhang zwischen Schmecken und Sehen",
						"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
						[
							createVideo(
								"https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
						[
							createTextQuestion(
								"Sequenzielle Fragen zu: Zusammenhang zwischen Schmecken und Sehen Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Zusammenhang zwischen Schmecken und Sehen Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Zusammenhang zwischen Schmecken und Sehen Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Zusammenhang zwischen Schmecken und Sehen Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createMultipleChoice(
								"Frage zu Zusammenhang zwischen Schmecken und Sehen?",
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
						"Der Proust-Effekt oder auch Madeleine-Effekt",
						"Aktivierungsfrage zu: Der Proust-Effekt oder auch Madeleine-Effekt",
						"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
						[
							createVideo(
								"https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
						[
							createTextQuestion(
								"Sequenzielle Fragen zu: Der Proust-Effekt oder auch Madeleine-Effekt Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Der Proust-Effekt oder auch Madeleine-Effekt Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Der Proust-Effekt oder auch Madeleine-Effekt Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createTextQuestion(
								"Sequenzielle Fragen zu: Der Proust-Effekt oder auch Madeleine-Effekt Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
								["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
								["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
							),
							createMultipleChoice(
								"Frage zu Der Proust-Effekt oder auch Madeleine-Effekt?",
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
	"Das Wahrnehmungssystem zum Schmecken",
	null,
	"Hierbei geht es um die biologischen und die neurophysiologischen/-anatomischen Grundlagen der Signalverarbeitung, den Spezifika und Prinzipien des **Schmeckens** sowie um Beispiele für die gustatorische Wahrnehmung.",
	"",
	chapters
);

