import {
	createCourse,
	createLesson,
	createVideo,
	createMultipleChoice,
	createTextQuestion
} from "../seed-functions";

const ch_Signaluebertragung = {
	title: "1. Signalübertragung im Nervensystem",
	description:
		"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
	content: [
		createLesson(
			"Struktur und Funktion des Nervensystems",
			"Aktivierungsfrage: In welche zwei unterschiedlichen Systeme wird das periphere Nervensystem aufgeteilt?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 33 - 34). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://www.youtube.com/watch?v=18JPgHnUvLQ", 354)],
			[
				createMultipleChoice(
					"In welche zwei unterschiedlichen Systeme wird das periphere Nervensystem aufgeteilt?",
					[
						{
							content: "Willkürliches und unwillkürliches (vegatives) Nervensystem",
							isCorrect: true
						},
						{
							content: "Gehirn und Rückenmark",
							isCorrect: false
						},
						{
							content: "somatisches und vegetatives Nervensystem",
							isCorrect: true
						},
						{
							content:
								"sensorische (afferente) und motorische (efferente) Untereinheiten",
							isCorrect: true
						}
					]
				),
				createTextQuestion(
					"In welche zwei unterschiedlichen Systeme wird das periphere Nervensystem aufgeteilt?",
					[
						"willkürliches und unwillkürliches (vegatives) Nervensystem",
						"somatisches und vegetatives Nervensystem",
						"sensorische (afferente) und motorische (efferente) Untereinheiten"
					]
				)
			]
		),
		createLesson(
			"Die Nervenzelle",
			"Aktivierungsfrage: Welche Klassen von Neuronen gibt es?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 34 - 35). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://youtu.be/prK8Hw0GCDg", 355)],
			[
				createMultipleChoice("Welche Klassen von Neuronen gibt es?", [
					{
						content: "Sensorische, motorische und zwischengeschaltete Neuronen",
						isCorrect: true
					},
					{
						content: "marklose oder unmyelinisierte Nervenfasern",
						isCorrect: false
					},
					{
						content:
							"Neurone, die die Impulse, die sie von den Rezeptoren der verschiedenen Sinnesorgane empfangen, zum ZNS übertragen.",
						isCorrect: true
					},
					{
						content:
							"Neurone, die die Signale, die vom Gehirn oder Rückemark kommen, zu den Effektorganen, den Muskeln und Drüsen weiterleiten.",
						isCorrect: true
					}
				]),
				createTextQuestion("Welche Klassen von Neuronen gibt es", [
					"Sensorische, motorische und zwischengeschaltete Neuronen",
					"Neurone, die die Impulse, die sie von den Rezeptoren der verschiedenen Sinnesorgane empfangen, zum ZNS übertragen.",
					"Neurone, die die Signale, die vom Gehirn oder Rückemark kommen, zu den Effektorganen, den Muskeln und Drüsen weiterleiten."
				])
			]
		),
		createLesson(
			"Erregung und Erregungsleitung im Nervensystem",
			"Aktivierungsfrage: Was versteht man unter einem Aktionspotential?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 35 - 36). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://youtu.be/gyzadOX3KwE", 356)],
			[
				createMultipleChoice("Was versteht man unter einem Aktionspotential?", [
					{
						content:
							"Beim Aktionspotential (Nervenimpuls) handelt es sich im eine im Neuron ausgelöste kurzfristige elektrische Landung (Potential), die das Axon entlang läuft und an der Zielsynapse die Ausschüttung eines Neurotransmitters verursacht.",
						isCorrect: true
					},
					{
						content:
							"Beim Aktionspotential (*action potential*) handelt es sich um die plötzliche Veränderung des elektrischen Potentials, die entlang des Axons eines Neurons wandert.",
						isCorrect: true
					},
					{
						content:
							"Beim Aktionspotential (*action potential*) handelt es sich um die Zeitspanne, in der die Nervenzelle auch durch einen noch so hohen Reiz nicht erregbar ist.",
						isCorrect: false
					},
					{
						content:
							"Aktionspotentiale entstehen, wenn die Membran vom Ruhepotential von -80mV ausgehend auf mindestens -50mV depolarisiert wird.",
						isCorrect: true
					}
				]),
				createTextQuestion("Was versteht man unter einem Aktionspotential?", [
					"Neuron ausgelöste kurzfristige elektrische Landung",
					"plötzliche Veränderung des elektrischen Potentials",
					"Membran vom Ruhepotential"
				])
			]
		),
		createLesson(
			"Nervenleitung in myelinisierten Axonen",
			"Aktivierungsfrage: Was versteht man unter saltatorischer Erregungsleitung?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 36). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://studyflix.de/biologie/erregungsleitung-2753?topic_id=321", 357)],
			[
				createMultipleChoice("Was versteht man unter saltatorischer Erregungsleitung?", [
					{
						content:
							"Wenn die Ionen die Axonmembran nur an den Einschnürungen zwischen den Myelinsegmenten, den Ranvier-Schnürringen, passieren können.",
						isCorrect: true
					},
					{
						content:
							"Es handelt sich um eine bei allen Lebewesen vorkommende Art der Erregungsleitung in Neuronen.",
						isCorrect: false
					},
					{
						content:
							"Die saltatorische Erregungsleitung sorgt für eine 'sprunghafte' Weiterleitung durch getrennte Depolarisierung an den Ranvierschen Schnürringen. Vorteil: höhere Geschwindigkeit.",
						isCorrect: true
					},
					{
						content:
							"Die saltatorische Erregungsleitung kommt bei allen Nervenfasern vor.",
						isCorrect: false
					}
				]),
				createTextQuestion("Was versteht man unter saltatorischer Erregungsleitung?", [
					"wenn die Ionen die Axonmembran passieren",
					"sprunghafte Weiterleitung",
					"Ranvier-Schnürringe"
				])
			]
		),
		createLesson(
			"Synaptische Übertragung",
			"Aktivierungsfrage: Was versteht man unter synaptischer Übertragung?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 36 - 37). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://youtu.be/bmvUnIGyfoI", 357)],
			[
				createMultipleChoice("Was versteht man unter synaptischer Übertragung?", [
					{
						content:
							"Unter synaptischer Übertragung versteht man die Übertragung der Erregung mittels chemischer Botenstoffe, den sogenannten Neurotransmittern.",
						isCorrect: true
					},
					{
						content: "Unter synaptischer Übertragung versteht man...",
						isCorrect: false
					},
					{
						content: "Unter synaptischer Übertragung versteht man...",
						isCorrect: true
					},
					{
						content: "Unter synaptischer Übertragung versteht man...",
						isCorrect: false
					}
				]),
				createTextQuestion("Was versteht man unter synaptischer Übertragung?", [
					"Antwort A",
					"Antwort B",
					"Antwort C"
				])
			]
		),
		createLesson(
			"Integration erregender und hemmender Impulse",
			"Aktivierungsfrage: Was versteht man unter räumlicher und zeitlicher Summation?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 37 - 39). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://youtu.be/r4ZSQcXSNtM", 358)],
			[
				createMultipleChoice(
					"Was versteht man unter räumlicher und zeitlicher Summation?",
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
					]
				),
				createTextQuestion("Was versteht man unter räumlicher und zeitlicher Summation?", [
					"Antwort A",
					"Antwort B",
					"Antwort C"
				])
			]
		),
		createLesson(
			"Neurotransmittersysteme und Neurorezeptoren",
			"Aktivierungsfrage: Wie funktionieren Neurotransmitter?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 39 - 40). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://studyflix.de/biologie/neurotransmitter-2837?topic_id=321", 359)],
			[
				createMultipleChoice("Wie funktionieren Neurotransmitter?", [
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
				]),
				createTextQuestion("Wie funktionieren Neurotransmitter?", [
					"Antwort A",
					"Antwort B",
					"Antwort C"
				])
			]
		),
		createLesson(
			"Drogen und synaptische Transmission",
			"Aktivierungsfrage: Welchen Einfluss haben Drogen auf die Transmission?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 40 - 41). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			[createVideo("https://youtu.be/35Z1OSHdfeM", 360)],
			[
				createMultipleChoice("Welchen Einfluss haben Drogen auf die Transmission?", [
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
				]),
				createTextQuestion("Welchen Einfluss haben Drogen auf die Transmission?", [
					"Antwort A",
					"Antwort B",
					"Antwort C"
				])
			]
		),
		createLesson(
			"Nervennetze und Informationsverarbeitung",
			"Aktivierungsfrage: Was versteht man unter einem monosynaptischen Reflexbogen?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 41 - 42). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://studyflix.de/biologie/reflexe-2794?topic_id=321", 361)],
			[
				createMultipleChoice("Was versteht man unter einem monosynaptischen Reflexbogen?", [
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
				]),
				createTextQuestion("Was versteht man unter einem monosynaptischen Reflexbogen?", [
					"Antwort A",
					"Antwort B",
					"Antwort C"
				])
			]
		)
	]
};

const ch_Organisation = {
	title: "Organisation im Nervensystem",
	description:
		"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
	content: [
		createLesson(
			"Zentralnervensystem",
			"Aktivierungsfrage: Was versteht man unter dorsal und ventral?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 42 - 43). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://www.youtube.com/watch?v=1MIMNwKLj34", 362)],
			[
				createMultipleChoice("Was versteht man unter dorsal und ventral?", [
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
				]),
				createTextQuestion("Was versteht man unter dorsal und ventral?", [
					"Antwort A",
					"Antwort B",
					"Antwort C"
				])
			]
		),
		createLesson(
			"Peripheres Nervensystem",
			"Aktivierungsfrage: In welche zwei unterschiedlichen Systeme wird das periphere Nervensystem aufgeteilt?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 43 - 44). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://www.youtube.com/watch?v=18JPgHnUvLQ", 363)],
			[
				createMultipleChoice(
					"In welche zwei unterschiedlichen Systeme wird das periphere Nervensystem aufgeteilt?",
					[
						{
							content: "Willkürliches und unwillkürliches (vegatives) Nervensystem",
							isCorrect: true
						},
						{
							content: "Gehirn und Rückenmark",
							isCorrect: false
						},
						{
							content: "somatisches und vegetatives Nervensystem",
							isCorrect: true
						},
						{
							content:
								"sensorische (afferente) und motorische (efferente) Untereinheiten",
							isCorrect: true
						}
					]
				),
				createTextQuestion(
					"In welche zwei unterschiedlichen Systeme wird das periphere Nervensystem aufgeteilt?",
					[
						"willkürliches und unwillkürliches (vegatives) Nervensystem",
						"somatisches und vegetatives Nervensystem",
						"sensorische (afferente) und motorische (efferente) Untereinheiten"
					]
				)
			]
		),
		createLesson(
			"Verhaltenssteuerung durch das neuroendokrine System",
			"Aktivierungsfrage: Wie wirkt sich das neuroendokrine System auf das Verhalten aus?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 44 - 48). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("", 364)],
			[
				createMultipleChoice(
					" Wie wirkt sich das neuroendokrine System auf das Verhalten aus?",
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
					]
				),
				createTextQuestion(
					" Wie wirkt sich das neuroendokrine System auf das Verhalten aus?",
					["Antwort A", "Antwort B", "Antwort C"]
				)
			]
		)
	]
};
const ch_StrukturGehirn = {
	title: "Struktur des Gehirns",
	description:
		"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
	content: [
		createLesson(
			"Die älteren Strukturen des Gehirns",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 48 - 52). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 365)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Die neueren Strukturen: das Großhirn",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 52 - 55). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 366)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Hirnasymmetrie und Sprachverarbeitung",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 55 - 57). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 367)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Das geteilte Gehirn",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 57 - 58). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 368)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Cerebrale Lateralisation",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 58 - 59). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 369)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		)
	]
};
const ch_GenerelleEigenschaften = {
	title: "Generelle Eigenschaften der Sinne",
	description:
		"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
	content: [
		createLesson(
			"Reize und Rezeptoren beim Sehen",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://studyflix.de/biologie/reflexe-2794?topic_id=321", 370)],
			[
				createMultipleChoice("Welche Aussage(n) zu Photorezeptoren sind **richtig**?", [
					{
						content: "Sind gleichmäßig über die Retina verteilt.",
						isCorrect: false
					},
					{
						content: "Schütten an ihren Endungen GABA aus.",
						isCorrect: false
					},
					{
						content: "Werden in Stäbchen und Zapfen unterteilt.",
						isCorrect: true
					},
					{
						content: "Werden in Stäbchen und Zapfen unterteilt.",
						isCorrect: false
					}
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Reize und Rezeptoren beim Hören",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 371)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Reize und Rezeptoren beim Fühlen",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 372)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Reize und Rezeptoren beim Riechen",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 373)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Reize und Rezeptoren beim Schmecken",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 374)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Reize und Rezeptoren bei der Körperbewegung",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 375)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Reize und Rezeptoren beim Gleichgewicht",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 376)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Reize und Rezeptoren bei den Empfindungen der Organe",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 378)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		)
	]
};
const ch_ErlebenMessbarMachen = {
	title: "Sinnliches Erleben messbar machen",
	description:
		"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
	content: [
		createLesson(
			"Wahrnehmungschwellen",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 77 - 79). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://studyflix.de/biologie/reflexe-2794?topic_id=321", 379)],
			[
				createMultipleChoice("Die Absolutschwelle kennzeichnet…", [
					{
						content:
							"… den Punkt, ab dem ein Individuum einen Reiz nicht mehr ertragen kann.",
						isCorrect: false
					},
					{
						content:
							"… den Punkt, an dem Menschen einen Reiz gerade noch wahrnehmen können.",
						isCorrect: true
					},
					{
						content:
							"… den kleinsten von Lebewesen noch bemerkbaren Unterschied zwischen zwei Reizen.",
						isCorrect: false
					},
					{
						content:
							"… den Punkt, an dem sich eine Person sicher ist, einen Reiz wahrgenommen zu haben.",
						isCorrect: false
					}
				]),
				createMultipleChoice("Die Unterschiedsschwelle kennzeichnet…", [
					{
						content:
							"… den Punkt, ab dem ein Individuum einen Reiz nicht mehr ertragen kann.",
						isCorrect: false
					},
					{
						content:
							"… den Punkt, an dem Menschen einen Reiz gerade noch wahrnehmen können.",
						isCorrect: false
					},
					{
						content:
							"… den kleinsten von Probanden noch bemerkbaren Unterschied zwischen zwei Reizen.",
						isCorrect: true
					},
					{
						content:
							"… den Punkt, an dem sich eine Person sicher ist, einen Reiz wahrgenommen zu haben.",
						isCorrect: false
					}
				]),
				createMultipleChoice(
					"Bei welcher Methode zur Bestimmung der Absolutschwelle stellt die Versuchsperson den Reiz selber ein?",
					[
						{
							content: "Grenzmethode",
							isCorrect: false
						},
						{
							content: "Konstanzmethode",
							isCorrect: false
						},
						{
							content: "Einstellungsmethode",
							isCorrect: false
						},
						{
							content: "Herstellungsmethode",
							isCorrect: true
						}
					]
				),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Weber`sches Gesetz",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 77 - 79). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 380)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Fechner`sches Gesetz",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 381)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Stevens`sche Potenzfunktion",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 382)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Signalentdeckungstheorie (*signal detection theory*)",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 81 - 83). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 383)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		),
		createLesson(
			"Adaptionsleveltheorie (*adaptation level theory*)",
			"Aktivierungsfrage: ...?",
			"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 83 - 84). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.</p>",
			[createVideo("https://youtu.be/nIA5Fy2RljU", 384)],
			[
				createMultipleChoice("Frage?", [
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
				]),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		)
	]
};

export const chapters = [
	ch_Signaluebertragung,
	ch_Organisation,
	ch_StrukturGehirn,
	ch_GenerelleEigenschaften,
	ch_ErlebenMessbarMachen
];

export const course = createCourse(
	"psychologie",
	"wahrnehmung",
	"Grundlagen der Wahrnehmung",
	null,
	"Zu den Grundlagen der Wahrnehmung gehört bspw. der Konstruktionsprozess der Wahrnehmung - vom Reiz bis zur neuronalen Verarbeitung - und mit welchen theoretischen Ansätzen und Gesetzen diese erklärt werden können. Zu den Wahrnehmungssystemen gehören die Systeme rund um das Sehen, das Hören, das Schmecken, das Riechen und das Fühlen.",
	"https://www.publicdomainpictures.net/pictures/280000/velka/optical-illusion-1542409604zVu.jpg",
	chapters
);
