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
			"Becker-Carus & Wendt, 2017: Allgemeine Psychologie, Seite 33 - 34",
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
			"Becker-Carus & Wendt, 2017: Allgemeine Psychologie, Seite 34 - 35",
			[createVideo("https://youtu.be/prK8Hw0GCDg", 354)],
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
		)
	]
};

const ch_Organisation = {
	title: "2. Organisation im Nervensystem",
	description:
		"Überlegen Sie jeweils vorher, was Sie schon zu den Themen wissen, bevor Sie sich die Videos anschauen.",
	content: [
		createLesson(
			"Zentralnervensystem",
			"Aktivierungsfrage: In welche zwei unterschiedlichen Systeme wird das periphere Nervensystem aufgeteilt?",
			"Becker-Carus & Wendt, 2017: Allgemeine Psychologie, Seite 42 - 43",
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
			"Peripheres Nervensystem",
			"Aktivierungsfrage: Welche Klassen von Neuronen gibt es?",
			"Becker-Carus & Wendt, 2017: Allgemeine Psychologie, Seite 43 - 44",
			[createVideo("https://youtu.be/prK8Hw0GCDg", 354)],
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
		)
	]
};

export const chapters = [ch_Signaluebertragung, ch_Organisation];

export const course = createCourse(
	"psychologie",
	"wahrnehmung",
	"Grundlagen der Wahrnehmung",
	null,
	"Zu den Grundlagen der Wahrnehmung gehört bspw. der Konstruktionsprozess der Wahrnehmung - vom Reiz bis zur neuronalen Verarbeitung - und mit welchen theoretischen Ansätzen und Gesetzen diese erklärt werden können. Zu den Wahrnehmungssystemen gehören die Systeme rund um das Sehen, das Hören, das Schmecken, das Riechen und das Fühlen.",
	"https://www.publicdomainpictures.net/pictures/280000/velka/optical-illusion-1542409604zVu.jpg",
	chapters
);
