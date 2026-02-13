import { faker } from "@faker-js/faker";
import {
	createCourse,
	createLesson,
	createMultipleChoice,
	createTextQuestion,
	createVideo
} from "../seed-functions";

const courseId = faker.string.alphanumeric(8);

export const chapters = [
	{
		title: "Geschmack - das gustatorische System",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson({
				courseId,
				title: "Aufbau und Funktion der Zunge",
				subtitle: "Aktivierungsfrage: Was ist der Ausgangspunkt der Geschmackswahrnehmung?",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 450)],
				questions: [
					createTextQuestion(
						"Sequenzielle Frage: Was ist der Ausgangspunkt der Geschmackswahrnehmung? Bitte begründen Sie kurz, ckdwieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
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
					createMultipleChoice({
						question: "Was ist der Ausgangspunkt der Geschmackswahrnehmung?",
						answers: [
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
						hints: ["Hinweis 1", "Hinweis 2", "Hinweis n"]
					})
				]
			}),
			createLesson({
				courseId,
				title: "Spezifika des Schmeckens",
				subtitle:
					"Aktivierungsfrage: Welche unterschiedlichen Geschmacksempfindungen gibt es?",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**W33 - 34führende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
				questions: [
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
					createMultipleChoice({
						question: "Welche unterschiedlichen Geschmacksempfindungen gibt es?",
						answers: [
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
						hints: ["Hinweis 1", "Hinweis 2", "Hinweis n"]
					})
				]
			})
		]
	},
	{
		title: "Neuronale Verarbeitung der gustatorischen Reizinformation (Geruchsrezeptoren)",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson({
				courseId,
				title: "Gustatorik und Gedächtnis",
				subtitle: "Aktivierungsfrage zu Gustatorik und Gedächtnis ",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Gustatorik und Gedächtnis?",
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
				courseId,
				title: "Besonderheiten der neuronalen Verschaltung beim Schmecken",
				subtitle: "Aktivierungsfrage zur neuronalen Verschaltung beim Schmecken",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zur neuronalen Verschaltung beim Schmecken?",
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
		title: "Neuronale Verarbeitung der höheren Zentren des Schmeckens",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson({
				courseId,
				title: "Nucleus Tractus Solitarii",
				subtitle: "Aktivierungsfrage zu: Nucleus Tractus Solitarii?",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Nucleus Tractus Solitarii?",
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
				courseId,
				title: "Gustatorischer Cortex ",
				subtitle: "Aktivierungsfrage zu: Gustatorischer Cortex?",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Gustatorischer Cortex?",
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
		title: "Prinzipien der gustatorischen Wahrnehmung",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson({
				courseId,
				title: "Prinzipien der gustatorischen Wahrnehmung - Textur",
				subtitle:
					"Aktivierungsfrage zu: Prinzipien der gustatorischen Wahrnehmung - Textur",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Prinzipien der gustatorischen Wahrnehmung - Textur?",
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
				courseId,
				title: "Prinzipien der gustatorischen Wahrnehmung - Geräusche",
				subtitle:
					"Aktivierungsfrage zu: Prinzipien der gustatorischen Wahrnehmung - Geräusche",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Prinzipien der gustatorischen Wahrnehmung - Geräusche?",
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
		title: "Zusammenhänge und Beispiele",
		description:
			"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson({
				courseId,
				title: " Zusammenhang zwischen Gustatorik und Hunger/Appetit ",
				subtitle:
					"Aktivierungsfrage zu: Zusammenhang zwischen Gustatorik und Hunger/Appetit?",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Zusammenhang zwischen Gustatorik und Hunger/Appetit?",
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
				courseId,
				title: "Zusammenhang zwischen Schmecken und Sehen",
				subtitle: "Aktivierungsfrage zu: Zusammenhang zwischen Schmecken und Sehen",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Zusammenhang zwischen Schmecken und Sehen?",
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
				courseId,
				title: "Der Proust-Effekt oder auch Madeleine-Effekt",
				subtitle: "Aktivierungsfrage zu: Der Proust-Effekt oder auch Madeleine-Effekt",
				description:
					"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 170ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				content: [createVideo("https://www.youtube.com/watch?v=nIA5Fy2RljU", 354)],
				questions: [
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
					createMultipleChoice({
						question: "Frage zu Der Proust-Effekt oder auch Madeleine-Effekt?",
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
	courseId,
	subjectId: "psychologie",
	specializationId: "wahrnehmung",
	title: "Das Wahrnehmungssystem zum Schmecken",
	description:
		"Hierbei geht es um die biologischen und die neurophysiologischen/-anatomischen Grundlagen der Signalverarbeitung, den Spezifika und Prinzipien des **Schmeckens** sowie um Beispiele für die gustatorische Wahrnehmung.",
	chapters
});
