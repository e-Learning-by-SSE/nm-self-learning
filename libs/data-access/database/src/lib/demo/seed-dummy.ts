import { createCourse, createLesson, createMultipleChoice, seedCaseStudy } from "../seed-functions";

const chapters = [
	{
		title: "Kapitel",
		description: "Kurze Beschreibung",
		content: [
			createLesson({
				title: "Lektion",
				subtitle: null,
				description: "Beschreibung",
				content: [],
				questions: [
					createMultipleChoice({
						question: "Ist diese Frage eine Ja/Nein-Frage?",
						answers: [
							{
								content: "Ja",
								isCorrect: true
							},
							{
								content: "Nein",
								isCorrect: false
							}
						]
					})
				]
			})
		]
	}
];

const courses = [
	createCourse({
		subjectId: "informatik",
		specializationId: "softwareentwicklung",
		title: "Testkurs",
		subtitle: "Untertitel",
		description: "Beschreibung",
		imgUrl: "",
		chapters
	})
];

export async function seedDummy(): Promise<void> {
	await seedCaseStudy("Dummy", courses, chapters, []);
}
