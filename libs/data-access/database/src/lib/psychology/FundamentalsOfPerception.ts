import {
	createCourse,
	createLesson,
	createVideo,
	createMultipleChoice,
	createTextQuestion
} from "../seed-functions";

export const chapters = [
	{
		title: "Kapitel 1 zur Wahrnemung",
		description: "Eine Beschreibung",
		content: [
			createLesson(
				"Titel eines Nanomoduls",
				"Überschrift 2. Ebene oder null",
				"Beschreibung oder null",
				[createVideo("link zum Video", 354)],
				[
					createMultipleChoice(
						"Frage",
						[
							{
								content: "Antwortmöglichkeit 1",
								isCorrect: true
							},
							{
								content: "Antwortmöglichkeit 2",
								isCorrect: true
							},
							{
								content: "Antwortmöglichkeit n",
								isCorrect: false
							}
						],
						["Optional: Hinweis 1", "Hinweis 2", "Hinweis n"]
					),
					createTextQuestion(
						"Eine Freitextfrage",
						["Akzeptierte Antwort 1", "Akzeptierte Antwort 2", "Akzeptierte Antwort n"],
						["Optional: Hinweis 1", "Optional: Hinweis 2", "Optional: Hinweis n"]
					)
				]
			)
		]
	}
];

export const course = createCourse(
	3,
	2,
	"Grundlagen der Wahrnehmung",
	null,
	"Zu den Grundlagen der Wahrnehmung gehört bspw. der Konstruktionsprozess der Wahrnehmung - vom Reiz bis zur neuronalen Verarbeitung - und mit welchen theoretischen Ansätzen und Gesetzen diese erklärt werden können. Zu den Wahrnehmungssystemen gehören die Systeme rund um das Sehen, das Hören, das Schmecken, das Riechen und das Fühlen.",
	"https://www.publicdomainpictures.net/pictures/280000/velka/optical-illusion-1542409604zVu.jpg",
	chapters
);
