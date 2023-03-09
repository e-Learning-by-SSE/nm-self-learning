import {
	createCourse,
	createLesson,
	createMultipleChoice,
	createTextQuestion,
	createVideo
} from '../seed-functions';


export const chapters = [
	{
		title: "Bewusstsein (*consciousness*)",
		description: "Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Definition(en) von Bewusstsein",
				"Aktivierungsfrage: Welche Definition(en) von Bewusstsein gibt es?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage: Welche Definition(en) von Bewusstsein gibt es? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nBewusstsein bezeichnet das wache Wissen um unser Erleben, um geistige und seelische Zustände, Wahrnehmungen und Gedanken sowie das Aufmerken auf einzelne Erlebnisse.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Welche Definition(en) von Bewusstsein gibt es? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nBewusstsein bezeichnet das wache Wissen um unser von uns kontrolliertes und initiiertes Handeln.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Welche Definition(en) von Bewusstsein gibt es? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nBewusstsein bezeichnet die Gesamtheit der unmittelbaren Erfahrung, die sich aus der Wahrnehmung von uns selbst und unserer Umgebung, unseren Kognitionen, Vorstellungen und Gefühlen zusammensetzt. \r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Welche Definition(en) von Bewusstsein gibt es? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nBewusstsein bezeichnet den wachen Zustand eines Menschen. \r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Welche Definition(en) von Bewusstsein gibt es?",
						[
							{
								content: "Bewusstsein bezeichnet das wache Wissen um unser Erleben, um geistige und seelische Zustände, Wahrnehmungen und Gedanken sowie das Aufmerken auf einzelne Erlebnisse.",
								isCorrect: true
							},
							{
								content: "Bewusstsein bezeichnet  das wache Wissen um unser von uns kontrolliertes und initiiertes Handeln.",
								isCorrect: true
							},
							{
								content: "Bewusstsein bezeichnet die Gesamtheit der unmittelbaren Erfahrung, die sich aus der Wahrnehmung von uns selbst und unserer Umgebung, unseren Kognitionen, Vorstellungen und Gefühlen zusammensetzt.",
								isCorrect: true
							},
							{
								content: "Bewusstsein bezeichnet den wachen Zustand eines Menschen.",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					),
				]
			),
			createLesson(
				"Bewusstseinszustände",
				"Welche qualitativ unterschiedlichen Zustände des Bewusstseins gibt es?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage: Welche qualitativ unterschiedlichen Zustände des Bewusstseins gibt es? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nSchlaf und Traum\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Welche qualitativ unterschiedlichen Zustände des Bewusstseins gibt es? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nHypnagogie und Hypnopompie\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Welche qualitativ unterschiedlichen Zustände des Bewusstseins gibt es? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\n meditative und drogeninduzierte Zustände\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Welche qualitativ unterschiedlichen Zustände des Bewusstseins gibt es? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nkontemplative und hysterische Zustände\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Welche qualitativ unterschiedlichen Zustände des Bewusstseins gibt es?",
						[
							{
								content: "Schlaf und Traum",
								isCorrect: false
							},
							{
								content: "Hypnagogie und Hypnopompie",
								isCorrect: true
							},
							{
								content: "meditative und drogeninduzierte Zustände",
								isCorrect: true
							},
							{
								content: "kontemplative und hysterische Zustände",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					),
				]
			),
			createLesson(
				"Bewusstsein und physiologische Aktivation",
				"Aktivierungsfrage: Was beschreibt die **Yerkes-Dodson'sche Regel**?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt die **Yerkes-Dodson'sche Regel**? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nden kurvilinearen Zusammenhang zwischen Aktivierungsniveau und Reizverarbeitung\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt die **Yerkes-Dodson'sche Regel**? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nden linearen Zusammenhang zwischen Aktivierungsniveau und Reizverarbeitung\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt die **Yerkes-Dodson'sche Regel**? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\ndie umgekehrt U-förmige Beziehung zwischen Erregung und Leistung bei verschiedenen Lernaufgaben\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt die **Yerkes-Dodson'sche Regel**? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\ndie lineare Beziehung zwischen Erregung und Leistung bei verschiedenen Lernaufgaben\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						" Was beschreibt die **Yerkes-Dodson'sche Regel**?",
						[
							{
								content: "den kurvilinearen Zusammenhang zwischen Aktivierungsniveau und Reizverarbeitung",
								isCorrect: true
							},
							{
								content: "den linearen Zusammenhang zwischen Aktivierungsniveau und Reizverarbeitung",
								isCorrect: false
							},
							{
								content: "die umgekehrt U-förmige Beziehung zwischen Erregung und Leistung bei verschiedenen Lernaufgaben",
								isCorrect: true
							},
							{
								content: "die lineare Beziehung zwischen Erregung und Leistung bei verschiedenen Lernaufgaben",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Grenzprozesse des Bewusstseins",
				"Aktivierungsfrage: Was beschreibt das *Tip-of-the-tongue*-Phänomen?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt das *Tip-of-the-tongue*-Phänomen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nEs bezeichnet ein Gedächtnisphänomen, bei dem ein eigentlich bekanntes Wort zu einem bestimmten Zeitpunkt im mentalen Lexikon nicht oder nur teilweise verfügbar ist.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt das *Tip-of-the-tongue*-Phänomen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nEs bezeichnet einen nach S. Freud sog. Vorbewussten Prozess, bei dem Erinnerungen, die dem Bewusstsein im Prinzip zugänglich sind, die aber momentan nicht bewusst sind.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt das *Tip-of-the-tongue*-Phänomen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt das *Tip-of-the-tongue*-Phänomen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\n Antwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Was beschreibt das *Tip-of-the-tongue*-Phänomen?",
						[
							{
								content: "Es bezeichnet ein Gedächtnisphänomen, bei dem ein eigentlich bekanntes Wort zu einem bestimmten Zeitpunkt im mentalen Lexikon nicht oder nur teilweise verfügbar ist.",
								isCorrect: true
							},
							{
								content: "Es bezeichnet einen nach S. Freud sog. Vorbewussten Prozess, bei dem Erinnerungen, die dem Bewusstsein im Prinzip zugänglich sind, die aber momentan nicht bewusst sind.",
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
		title: "Theoretische Ansätze zur Erklärung des Bewusstseins",
		description: "Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Arbeitsgedächtnismodell (Baddeley, 1986)",
				"Wie definiert Baddeley (1986) die im Gehirn ablaufenden **exekutiven Funktionen**?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage: Wie definiert Baddeley (1986) die im Gehirn ablaufenden **exekutiven Funktionen**? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nBaddeley (1986) definiert die exekutiven Funktionen des Gehirns als komplexe Prozesse, durch welche ein Individuum seine Handlungsweisen in Situationen optimiert, in denen das Tätigwerden mehrerer Prozesse erforderlich ist.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Wie definiert Baddeley (1986) die im Gehirn ablaufenden **exekutiven Funktionen**? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Wie definiert Baddeley (1986) die im Gehirn ablaufenden **exekutiven Funktionen**? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Wie definiert Baddeley (1986) die im Gehirn ablaufenden **exekutiven Funktionen**? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Wie definiert Baddeley (1986) die im Gehirn ablaufenden **exekutiven Funktionen**?",
						[
							{
								content: "Baddeley (1986) definiert die exekutiven Funktionen des Gehirns als komplexe Prozesse, durch welche ein Individuum seine Handlungsweisen in Situationen optimiert, in denen das Tätigwerden mehrerer Prozesse erforderlich ist.",
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
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Evolutionäre Ansätze zur Erklärung des Bewusstseins",
				"Wovon geht Donald (1995) in seinem evolutionären Ansatz zum Bewusstsein aus?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage: Wovon geht Donald (1995) in seinem evolutionären Ansatz zum Bewusstsein aus? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nzunehmender Plastizität des Gehirns\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Wovon geht Donald (1995) in seinem evolutionären Ansatz zum Bewusstsein aus? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Wovon geht Donald (1995) in seinem evolutionären Ansatz zum Bewusstsein aus? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Wovon geht Donald (1995) in seinem evolutionären Ansatz zum Bewusstsein aus? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Wovon geht Donald (1995) in seinem evolutionären Ansatz zum Bewusstsein aus?",
						[
							{
								content: "zunehmender Plastizität des Gehirns",
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
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					)
				]
			),
			createLesson(
				"Neurowissenschaftliche Ansätze des Bewusstseins",
				"Aktivierungsfrage: Was versteht man unter ereigniskorrelierten Potentialen (ERP)?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage: Was versteht man unter ereigniskorrelierten Potentialen (ERP)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nERP sind aus dem spontanen Elektroencephalogramm durch Mittelung (*Averaging*) extrahierte Potentiale, die meist im Zeitbereich von 60 bis 1000 ms nach dem Stimulus auftreten.\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was versteht man unter ereigniskorrelierten Potentialen (ERP)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was versteht man unter ereigniskorrelierten Potentialen (ERP)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was versteht man unter ereigniskorrelierten Potentialen (ERP)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Was versteht man unter ereigniskorrelierten Potentialen (ERP)?",
						[
							{
								content: "ERP sind aus dem spontanen Elektroencephalogramm durch Mittelung (*Averaging*) extrahierte Potentiale, die meist im Zeitbereich von 60 bis 1000 ms nach dem Stimulus auftreten.",
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
				"Philosophische Ansätze des Bewusstseins",
				"Was beschreibt das Leib-Seele-Problem (*mind body problem*)(Decartes, 17. Jh.) des Bewusstseins?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt das Leib-Seele-Problem (*mind body problem*)(Decartes, 17. Jh.) des Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt das Leib-Seele-Problem (*mind body problem*)(Decartes, 17. Jh.) des Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt das Leib-Seele-Problem (*mind body problem*)(Decartes, 17. Jh.) des Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage: Was beschreibt das Leib-Seele-Problem (*mind body problem*)(Decartes, 17. Jh.) des Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Was beschreibt das Leib-Seele-Problem (*mind body problem*)(Decartes, 17. Jh.) des Bewusstseins?",
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
			)
		]
	},
	{
		title: "Empirische Bewusstseinsforschung",
		description: "Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Bewusste und unbewusste Wahrnehmung",
				"Aktivierungsfrage zu bewusster und unbewusster Wahrnehmung?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu bewusster und unbewusster Wahrnehmung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu bewusster und unbewusster Wahrnehmung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu bewusster und unbewusster Wahrnehmung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu bewusster und unbewusster Wahrnehmung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu bewusster und unbewusster Wahrnehmung?",
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
				"Funktionen des Bewusstseins - Selektion ",
				"Aktivierungsfrage zu Funktionen des Bewusstseins - Selektion?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Funktionen des Bewusstseins - Selektion? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Funktionen des Bewusstseins - Selektion? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Funktionen des Bewusstseins - Selektion? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Funktionen des Bewusstseins - Selektion? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Funktionen des Bewusstseins - Selektion?",
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
				"Störungen des visuellen Bewusstseins beim hirnverletzten Patienten",
				"Aktivierungsfrage zu Störungen des visuellen Bewusstseins beim hirnverletzten Patienten?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Störungen des visuellen Bewusstseins beim hirnverletzten Patienten? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Störungen des visuellen Bewusstseins beim hirnverletzten Patienten? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Störungen des visuellen Bewusstseins beim hirnverletzten Patienten? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Störungen des visuellen Bewusstseins beim hirnverletzten Patienten? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Störungen des visuellen Bewusstseins beim hirnverletzten Patienten?",
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
				"Das neuronale Korrelat des visuellen Bewusstseins",
				"Aktivierungsfrage zum neuronalen Korrelat des visuellen Bewusstseins?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zum neuronalen Korrelat des visuellen Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zum neuronalen Korrelat des visuellen Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zum neuronalen Korrelat des visuellen Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zum neuronalen Korrelat des visuellen Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zum neuronalen Korrelat des visuellen Bewusstseins?",
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
				"Bewusstsein und höhere kognitive Funktionen",
				"Aktivierungsfrage zu Bewusstsein und höhere kognitive Funktionen?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstsein und höhere kognitive Funktionen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstsein und höhere kognitive Funktionen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstsein und höhere kognitive Funktionen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstsein und höhere kognitive Funktionen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Bewusstsein und höhere kognitive Funktionen?",
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
		title: "Die Psychologie des Bewusstseins",
		description: "Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Bewusstsein als Überlebenshilfe",
				"Aktivierungsfrage zu Bewusstsein als Überlebenshilfe?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstsein als Überlebenshilfe? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstsein als Überlebenshilfe? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstsein als Überlebenshilfe? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstsein als Überlebenshilfe? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Bewusstsein als Überlebenshilfe?",
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
				"Einflüsse des Bewusstseins auf Kultur und Umwelt",
				"Aktivierungsfrage zu Einflüsse des Bewusstseins auf Kultur und Umwelt?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Einflüsse des Bewusstseins auf Kultur und Umwelt? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Einflüsse des Bewusstseins auf Kultur und Umwelt? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Einflüsse des Bewusstseins auf Kultur und Umwelt? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Einflüsse des Bewusstseins auf Kultur und Umwelt? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Einflüsse des Bewusstseins auf Kultur und Umwelt?",
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
				"Der wissenschaftliche Status des Bewusstseins",
				"Aktivierungsfrage zum wissenschaftlichen Status des Bewusstseins?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zum wissenschaftlichen Status des Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zum wissenschaftlichen Status des Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zum wissenschaftlichen Status des Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zum wissenschaftlichen Status des Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zum wissenschaftlichen Status des Bewusstseins?",
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
				"Bewusstsein und Aufmerksamkeit ",
				"Aktivierungsfrage zu Bewusstsein und Aufmerksamkeit?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstsein und Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstsein und Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstsein und Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstsein und Aufmerksamkeit? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Bewusstsein und Aufmerksamkeit?",
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
				"Nicht bewusste Verarbeitungsprozesse",
				"Aktivierungsfrage zu nicht bewusste Verarbeitungsprozesse?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu nicht bewusste Verarbeitungsprozesse? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu nicht bewusste Verarbeitungsprozesse? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu nicht bewusste Verarbeitungsprozesse? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu nicht bewusste Verarbeitungsprozesse? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu nicht bewusste Verarbeitungsprozesse?",
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
				"Funktionen und Limitationen des Bewusstseins",
				"Aktivierungsfrage zu Funktionen und Limitationen des Bewusstseins",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Funktionen und Limitationen des Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Funktionen und Limitationen des Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Funktionen und Limitationen des Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Funktionen und Limitationen des Bewusstseins? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Funktionen und Limitationen des Bewusstseins?",
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
				"Bewusstseinsphänomene - Methoden unbewusster Präsentation - Gorilla (Simons & Chabris, 1999)",
				"Aktivierungsfrage zu Bewusstseinsphänomene - Methoden unbewusster Präsentation - Gorilla (Simons & Chabris, 1999)",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsphänomene - Methoden unbewusster Präsentation - Gorilla (Simons & Chabris, 1999)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsphänomene - Methoden unbewusster Präsentation - Gorilla (Simons & Chabris, 1999)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsphänomene - Methoden unbewusster Präsentation - Gorilla (Simons & Chabris, 1999)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsphänomene - Methoden unbewusster Präsentation - Gorilla (Simons & Chabris, 1999)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Bewusstseinsphänomene - Methoden unbewusster Präsentation - Gorilla (Simons & Chabris, 1999)?",
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
				"Bewusstseinsphänomene - Methoden unbewusster Präsentation - Inattentional Blindness",
				"Aktivierungsfrage zu Bewusstseinsphänomene - Methoden unbewusster Präsentation - Inattentional Blindness",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsphänomene - Methoden unbewusster Präsentation - Inattentional Blindness? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsphänomene - Methoden unbewusster Präsentation - Inattentional Blindness? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsphänomene - Methoden unbewusster Präsentation - Inattentional Blindness? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsphänomene - Methoden unbewusster Präsentation - Inattentional Blindness? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Bewusstseinsphänomene - Methoden unbewusster Präsentation - Inattentional Blindness?",
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
			)
		]
	},
	{
		title: "Die Dualität des Bewusstseins",
		description: "Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Zerebrale Dominanz",
				"Aktivierungsfrage zu zerebraler Dominanz?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu zerebraler Dominanz? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu zerebraler Dominanz? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu zerebraler Dominanz? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu zerebraler Dominanz? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu zerebraler Dominanz?",
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
				"Komplementäre Zugangsweise zur Welt?",
				"Aktivierungsfrage zu komplementäre Zugangsweise zur Welt?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu komplementäre Zugangsweise zur Welt? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu komplementäre Zugangsweise zur Welt? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu komplementäre Zugangsweise zur Welt? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu komplementäre Zugangsweise zur Welt? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu komplementäre Zugangsweise zur Welt?",
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
				"Bewusstseinsveränderung im Alltag",
				"Aktivierungsfrage zu Bewusstseinsveränderung im Alltag?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsveränderung im Alltag? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsveränderung im Alltag? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsveränderung im Alltag? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsveränderung im Alltag? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Bewusstseinsveränderung im Alltag?",
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
				"Tagträume und Phantasien",
				"Aktivierungsfrage zu Tagträume und Phantasien?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Tagträume und Phantasien? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Tagträume und Phantasien? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Tagträume und Phantasien? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Tagträume und Phantasien? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Tagträume und Phantasien?",
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
		title: "Erweiterte Bewusstseinszustände",
		description: "Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Krankhafte Bewusstseinsveränderungen",
				"Aktivierungsfrage zu krankhaften Bewusstseinsveränderungen?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu krankhaften Bewusstseinsveränderungen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu krankhaften Bewusstseinsveränderungen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu krankhaften Bewusstseinsveränderungen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu krankhaften Bewusstseinsveränderungen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu krankhaften Bewusstseinsveränderungen?",
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
				"Halluzinationen",
				"Aktivierungsfrage zu Halluzinationen?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Halluzinationen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Halluzinationen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Halluzinationen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Halluzinationen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Halluzinationen?",
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
				"Hypnose",
				"Aktivierungsfrage zu Hypnose?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Hypnose? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Hypnose? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Hypnose? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Hypnose? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Hypnose?",
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
				"Bewusstseinsveränderung durch Drogen",
				"Aktivierungsfrage zu Bewusstseinsveränderung durch Drogen?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsveränderung durch Drogen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsveränderung durch Drogen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsveränderung durch Drogen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Bewusstseinsveränderung durch Drogen? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Bewusstseinsveränderung durch Drogen?",
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
		title: "Schlaf, Traum und zirkadiane Rhythmik",
		description: "Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Schlafphasen und -rhythmik",
				"Aktivierungsfrage zu Schlafphasen und -rhythmik?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Schlafphasen und -rhythmik? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Schlafphasen und -rhythmik? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Schlafphasen und -rhythmik? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Schlafphasen und -rhythmik? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Schlafphasen und -rhythmik?",
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
				"Zirkadiane Periodik und innere Uhren",
				"Aktivierungsfrage zu zirkadiane Periodik und innere Uhren?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu zirkadiane Periodik und innere Uhren? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu zirkadiane Periodik und innere Uhren? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu zirkadiane Periodik und innere Uhren? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu zirkadiane Periodik und innere Uhren? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu zirkadiane Periodik und innere Uhren?",
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
				"Schlaftheorien",
				"Aktivierungsfrage zu Schlaftheorien?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Schlaftheorien? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Schlaftheorien? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Schlaftheorien? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Schlaftheorien? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Schlaftheorien?",
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
				"Träumen, Traumtheorien und REM-Schlaf",
				"Aktivierungsfrage zu Träumen, Traumtheorien und REM-Schlaf?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Träumen, Traumtheorien und REM-Schlaf? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Träumen, Traumtheorien und REM-Schlaf? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Träumen, Traumtheorien und REM-Schlaf? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Träumen, Traumtheorien und REM-Schlaf? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Träumen, Traumtheorien und REM-Schlaf?",
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
				"Schlafentzug und seine Auswirkung",
				"Aktivierungsfrage zu Schlafentzug und seine Auswirkung?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Schlafentzug und seine Auswirkung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Schlafentzug und seine Auswirkung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Schlafentzug und seine Auswirkung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Schlafentzug und seine Auswirkung? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Schlafentzug und seine Auswirkung?",
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
		title: "Experimente zum Bewusstsein",
		description: "Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
		content: [
			createLesson(
				"Experiment - Einfluss unbewusster Reize - Response Priming (Vorberg, Mattler, Heinecke, Schmidt & Schwarzbach, 2003)",
				"Aktivierungsfrage zu Response Priming?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zu Response Priming? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Response Priming? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Response Priming? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zu Response Priming? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zu Response Priming?",
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
				"Das James Vicary-Experiment - Iss-Popcorn-trink-Cola-Studie",
				"Aktivierungsfrage zum James Vicary-Experiment - Iss-Popcorn-trink-Cola-Studie?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zum James Vicary-Experiment - Iss-Popcorn-trink-Cola-Studie? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zum James Vicary-Experiment - Iss-Popcorn-trink-Cola-Studie? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zum James Vicary-Experiment - Iss-Popcorn-trink-Cola-Studie? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zum James Vicary-Experiment - Iss-Popcorn-trink-Cola-Studie? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zum James Vicary-Experiment - Iss-Popcorn-trink-Cola-Studie?",
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
				"Experiment von Boris Sidis (1898)",
				"Aktivierungsfrage zu Bewusstseinsveränderung im Alltag?",
				"**Basisliteratur**: \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 223ff). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**: \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
				[
					createVideo(
						"https://www.youtube.com/watch?v=nIA5Fy2RljU", 451)],
				[
					createTextQuestion(
						"Sequenzielle Frage zum Experiment von Boris Sidis (1898)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort A\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zum Experiment von Boris Sidis (1898)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nsAntwort B\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zum Experiment von Boris Sidis (1898)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort C\r\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createTextQuestion(
						"Sequenzielle Frage zum Experiment von Boris Sidis (1898)? Bitte begründen Sie kurz, wieso Sie meinen, dass die folgende Antwort richtig oder falsch ist.\r\nAntwort D\n",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					),
					createMultipleChoice(
						"Frage zum Experiment von Boris Sidis (1898)?",
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
export const course = (
	createCourse(
		"psychologie",
		"bewusstsein",
		"Bewusstsein",
		null,
		"Beim **Bewusstsein** geht es darum die psychologische Definition von einem alltagspsychologischen Verständnis abzugrenzen. Dabei sollen die verschiedenen Funktionen von Bewusstsein erläutert werden und mit Hilfe welcher Experimente die Bewusstseinsphänomene erforscht werden können. \n ## Die Studierenden sind in der Lage ... \r\n * die Definitionen von **Bewusstsein** zu erinnern; \r\n * die verschiedenen die verschiedenen Bewusstseinszustände zu erinnern; \r\n * Experimente zur Erforschung von Bewusstseinsphänomenen zu kennen und nachzuvollziehen und Replikationen mit Hilfestellung selbst durchzuführen",
		"https://get.pxhere.com/photo/woman-texture-floor-window-glass-wall-female-thinking-pattern-green-color-drive-think-tile-face-art-design-psychology-head-symmetry-mosaic-psyche-shape-awareness-thoughts-perception-personality-flooring-subconscious-mind-unconscious-thought-process-psychologist-1192085.jpg",
		chapters
	)
);



