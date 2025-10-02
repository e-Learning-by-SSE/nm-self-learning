import { faker } from "@faker-js/faker";
import {
	createCourse,
	createLesson,
	createMultipleChoice,
	createTextQuestion,
	createVideo
} from "../seed-functions";

const courseId = faker.string.alphanumeric(8);

const ch_Signaluebertragung = {
	title: "Signalübertragung im Nervensystem",
	description:
		"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
	content: [
		createLesson({
			courseId,
			title: "Struktur und Funktion des Nervensystems",
			subtitle:
				"Aktivierungsfrage: In welche zwei unterschiedlichen Systeme wird das periphere Nervensystem aufgeteilt?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 33 - 34). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://www.youtube.com/watch?v=18JPgHnUvLQ", 354)],
			questions: [
				createMultipleChoice({
					question:
						"In welche zwei unterschiedlichen Systeme wird das periphere Nervensystem aufgeteilt?",
					answers: [
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
				}),
				createTextQuestion(
					"In welche zwei unterschiedlichen Systeme wird das periphere Nervensystem aufgeteilt?",
					[
						"willkürliches und unwillkürliches (vegatives) Nervensystem",
						"somatisches und vegetatives Nervensystem",
						"sensorische (afferente) und motorische (efferente) Untereinheiten"
					]
				)
			]
		}),
		createLesson({
			courseId,
			title: "Die Nervenzelle",
			subtitle: "Aktivierungsfrage: Welche Klassen von Neuronen gibt es?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 34 - 35). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/prK8Hw0GCDg", 355)],
			questions: [
				createMultipleChoice({
					question: "Welche Klassen von Neuronen gibt es?",
					answers: [
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
					]
				}),
				createTextQuestion("Welche Klassen von Neuronen gibt es", [
					"Sensorische, motorische und zwischengeschaltete Neuronen",
					"Neurone, die die Impulse, die sie von den Rezeptoren der verschiedenen Sinnesorgane empfangen, zum ZNS übertragen.",
					"Neurone, die die Signale, die vom Gehirn oder Rückemark kommen, zu den Effektorganen, den Muskeln und Drüsen weiterleiten."
				])
			]
		}),
		createLesson({
			courseId,
			title: "Erregung und Erregungsleitung im Nervensystem",
			subtitle: "Aktivierungsfrage: Was versteht man unter einem Aktionspotential?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 35 - 36). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/gyzadOX3KwE", 356)],
			questions: [
				createMultipleChoice({
					question: "Was versteht man unter einem Aktionspotential?",
					answers: [
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
					]
				}),
				createTextQuestion("Was versteht man unter einem Aktionspotential?", [
					"Neuron ausgelöste kurzfristige elektrische Landung",
					"plötzliche Veränderung des elektrischen Potentials",
					"Membran vom Ruhepotential"
				])
			]
		}),
		createLesson({
			courseId,
			title: "Nervenleitung in myelinisierten Axonen",
			subtitle: "Aktivierungsfrage: Was versteht man unter saltatorischer Erregungsleitung?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 36). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [
				createVideo("https://studyflix.de/biologie/erregungsleitung-2753?topic_id=321", 357)
			],
			questions: [
				createMultipleChoice({
					question: "Was versteht man unter saltatorischer Erregungsleitung?",
					answers: [
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
					]
				}),
				createTextQuestion("Was versteht man unter saltatorischer Erregungsleitung?", [
					"wenn die Ionen die Axonmembran passieren",
					"sprunghafte Weiterleitung",
					"Ranvier-Schnürringe"
				])
			]
		}),
		createLesson({
			courseId,
			title: "Synaptische Übertragung",
			subtitle: "Aktivierungsfrage: Was versteht man unter synaptischer Übertragung?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 36 - 37). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/bmvUnIGyfoI", 357)],
			questions: [
				createMultipleChoice({
					question: "Was versteht man unter synaptischer Übertragung?",
					answers: [
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
					]
				}),
				createTextQuestion("Was versteht man unter synaptischer Übertragung?", [
					"Antwort A",
					"Antwort B",
					"Antwort C"
				])
			]
		}),
		createLesson({
			courseId,
			title: "Integration erregender und hemmender Impulse",
			subtitle:
				"Aktivierungsfrage: Was versteht man unter räumlicher und zeitlicher Summation?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 37 - 39). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/r4ZSQcXSNtM", 358)],
			questions: [
				createMultipleChoice({
					question: "Was versteht man unter räumlicher und zeitlicher Summation?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Was versteht man unter räumlicher und zeitlicher Summation?", [
					"Antwort A",
					"Antwort B",
					"Antwort C"
				])
			]
		}),
		createLesson({
			courseId,
			title: "Neurotransmittersysteme und Neurorezeptoren",
			subtitle: "Aktivierungsfrage: Wie funktionieren Neurotransmitter?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 39 - 40). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [
				createVideo("https://studyflix.de/biologie/neurotransmitter-2837?topic_id=321", 359)
			],
			questions: [
				createMultipleChoice({
					question: "Wie funktionieren Neurotransmitter?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Wie funktionieren Neurotransmitter?", [
					"Antwort A",
					"Antwort B",
					"Antwort C"
				])
			]
		}),
		createLesson({
			courseId,
			title: "Drogen und synaptische Transmission",
			subtitle: "Aktivierungsfrage: Welchen Einfluss haben Drogen auf die Transmission?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 40 - 41). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/35Z1OSHdfeM", 360)],
			questions: [
				createMultipleChoice({
					question: "Welchen Einfluss haben Drogen auf die Transmission?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Welchen Einfluss haben Drogen auf die Transmission?", [
					"Antwort A",
					"Antwort B",
					"Antwort C"
				])
			]
		}),
		createLesson({
			courseId,
			title: "Nervennetze und Informationsverarbeitung",
			subtitle:
				"Aktivierungsfrage: Was versteht man unter einem monosynaptischen Reflexbogen?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 41 - 42). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://studyflix.de/biologie/reflexe-2794?topic_id=321", 361)],
			questions: [
				createMultipleChoice({
					question: "Was versteht man unter einem monosynaptischen Reflexbogen?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Was versteht man unter einem monosynaptischen Reflexbogen?", [
					"Antwort A",
					"Antwort B",
					"Antwort C"
				])
			]
		})
	]
};

const ch_Organisation = {
	title: "Organisation im Nervensystem",
	description:
		"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
	content: [
		createLesson({
			courseId,
			title: "Zentralnervensystem",
			subtitle: "Aktivierungsfrage: Was versteht man unter dorsal und ventral?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 42 - 43). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://www.youtube.com/watch?v=1MIMNwKLj34", 362)],
			questions: [
				createMultipleChoice({
					question: "Was versteht man unter dorsal und ventral?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Was versteht man unter dorsal und ventral?", [
					"Antwort A",
					"Antwort B",
					"Antwort C"
				])
			]
		}),
		createLesson({
			courseId,
			title: "Peripheres Nervensystem",
			subtitle:
				"Aktivierungsfrage: In welche zwei unterschiedlichen Systeme wird das periphere Nervensystem aufgeteilt?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 43 - 44). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://www.youtube.com/watch?v=18JPgHnUvLQ", 363)],
			questions: [
				createMultipleChoice({
					question:
						"In welche zwei unterschiedlichen Systeme wird das periphere Nervensystem aufgeteilt?",
					answers: [
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
				}),
				createTextQuestion(
					"In welche zwei unterschiedlichen Systeme wird das periphere Nervensystem aufgeteilt?",
					[
						"willkürliches und unwillkürliches (vegatives) Nervensystem",
						"somatisches und vegetatives Nervensystem",
						"sensorische (afferente) und motorische (efferente) Untereinheiten"
					]
				)
			]
		}),
		createLesson({
			courseId,
			title: "Verhaltenssteuerung durch das neuroendokrine System",
			subtitle:
				"Aktivierungsfrage: Wie wirkt sich das neuroendokrine System auf das Verhalten aus?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 44 - 48). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("", 364)],
			questions: [
				createMultipleChoice({
					question: " Wie wirkt sich das neuroendokrine System auf das Verhalten aus?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion(
					" Wie wirkt sich das neuroendokrine System auf das Verhalten aus?",
					["Antwort A", "Antwort B", "Antwort C"]
				)
			]
		})
	]
};
const ch_StrukturGehirn = {
	title: "Struktur des Gehirns",
	description:
		"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
	content: [
		createLesson({
			courseId,
			title: "Die älteren Strukturen des Gehirns",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 48 - 52). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 365)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Die neueren Strukturen: das Großhirn",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 52 - 55). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 366)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Hirnasymmetrie und Sprachverarbeitung",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 55 - 57). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 367)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Das geteilte Gehirn",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 57 - 58). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 368)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Cerebrale Lateralisation",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 58 - 59). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 369)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		})
	]
};
const ch_GenerelleEigenschaften = {
	title: "Generelle Eigenschaften der Sinne",
	description:
		"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
	content: [
		createLesson({
			courseId,
			title: "Reize und Rezeptoren beim Sehen",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://studyflix.de/biologie/reflexe-2794?topic_id=321", 370)],
			questions: [
				createMultipleChoice({
					question: "Welche Aussage(n) zu Photorezeptoren sind **richtig**?",
					answers: [
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
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Reize und Rezeptoren beim Hören",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 371)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Reize und Rezeptoren beim Fühlen",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 372)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Reize und Rezeptoren beim Riechen",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 373)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Reize und Rezeptoren beim Schmecken",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 374)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Reize und Rezeptoren bei der Körperbewegung",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 375)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Reize und Rezeptoren beim Gleichgewicht",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 376)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Reize und Rezeptoren bei den Empfindungen der Organe",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 378)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		})
	]
};
const ch_ErlebenMessbarMachen = {
	title: "Sinnliches Erleben messbar machen",
	description:
		"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
	content: [
		createLesson({
			courseId,
			title: "Wahrnehmungschwellen",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 77 - 79). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://studyflix.de/biologie/reflexe-2794?topic_id=321", 379)],
			questions: [
				createMultipleChoice({
					question: "Die Absolutschwelle kennzeichnet…",
					answers: [
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
					]
				}),
				createMultipleChoice({
					question: "Die Unterschiedsschwelle kennzeichnet…",
					answers: [
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
					]
				}),
				createMultipleChoice({
					question:
						"Bei welcher Methode zur Bestimmung der Absolutschwelle stellt die Versuchsperson den Reiz selber ein?",
					answers: [
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
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Weber`sches Gesetz",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 77 - 79). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 380)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Fechner`sches Gesetz",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 381)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Stevens`sche Potenzfunktion",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 75 - 77). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 382)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Signalentdeckungstheorie (*signal detection theory*)",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 81 - 83). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 383)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		}),
		createLesson({
			courseId,
			title: "Adaptionsleveltheorie (*adaptation level theory*)",
			subtitle: "Aktivierungsfrage: ...?",
			description:
				"**Basisliteratur**:  \r\nBecker-Carus, C. & Wendt, M. (2017). *Allgemeine Psychologie. Eine Einführung* (Seite 83 - 84). Berlin: Springer.\r\n\r\n**Weiterführende Literatur**:  \r\nMüsseler, J. & Rieger, M. (Hg.) (2016). *Allgemeine Psychologie* (3. Aufl.). Berlin, Heidelberg: Springer.  \r\nSpada, H. (Hg.) (2006). *Lehrbuch allgemeine Psychologie* (3., vollst. überarb. und erw. Aufl.). Bern: Huber.",
			content: [createVideo("https://youtu.be/nIA5Fy2RljU", 384)],
			questions: [
				createMultipleChoice({
					question: "Frage?",
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
							isCorrect: true
						},
						{
							content: "Antwort D",
							isCorrect: false
						}
					]
				}),
				createTextQuestion("Frage?", ["Antwort A", "Antwort B", "Antwort C"])
			]
		})
	]
};

export const chapters = [
	ch_Signaluebertragung,
	ch_Organisation,
	ch_StrukturGehirn,
	ch_GenerelleEigenschaften,
	ch_ErlebenMessbarMachen
];

export const course = createCourse({
	courseId,
	subjectId: "psychologie",
	specializationId: "wahrnehmung",
	title: "Grundlagen der Wahrnehmung",
	description:
		"Zu den Grundlagen der Wahrnehmung gehört bspw. der Konstruktionsprozess der Wahrnehmung - vom Reiz bis zur neuronalen Verarbeitung - und mit welchen theoretischen Ansätzen und Gesetzen diese erklärt werden können. Zu den Wahrnehmungssystemen gehören die Systeme rund um das Sehen, das Hören, das Schmecken, das Riechen und das Fühlen.",
	imgUrl: "https://www.publicdomainpictures.net/pictures/280000/velka/optical-illusion-1542409604zVu.jpg",
	chapters
});
