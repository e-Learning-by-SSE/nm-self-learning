import {
	createCourse,
	createLesson,
	createVideo,
	createMultipleChoice,
	createTextQuestion
} from "../seed-functions";

export const chapters = [
	{
		title: "Kapitel 1 zum Sehen",
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
	"psychologie",
	"wahrnehmung",
	"Das Wahrnehmungssystem zum Sehen",
	null,
	"Hierbei geht es um die biologischen und die neurophysiologischen/-anatomischen Grundlagen der Signalverarbeitung, den Spezifika und Prinzipien des Hörens sowie um Beispiele für die auditive Wahrnehmung.",
	"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Auge.png/650px-Auge.png?20060121123626",
	chapters
);
