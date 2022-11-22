import {
    createArticle,
    createAuthor,
    createCourse,
    createLesson,
    createMultipleChoice,
    createTextQuestion,
    createVideo,
    read,
    seedCaseStudy,
} from './seed-functions';

const chaptersOfHearing = [
	{
		title: 'Kapitel 1 zum "Hören"',
		description: "Eine Beschreibung",
		content: []
	}
];

const chaptersOfVision = [
	{
		title: 'Kapitel 1 zum "Sehen"',
		description: "Eine Beschreibung",
		content: []
	}
];

const courses = [
	createCourse(
		2,
		"Das Wahrnehmungssystem zum Hören",
		null,
		"Hierbei geht es um die biologischen und die neurophysiologischen/-anatomischen Grundlagen der Signalverarbeitung, den Spezifika und Prinzipien des Hörens sowie um Beispiele für die auditive Wahrnehmung.",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/%C3%84u%C3%9Feres_Ohr_-_Mittelohr_-_Innenohr.jpg/769px-%C3%84u%C3%9Feres_Ohr_-_Mittelohr_-_Innenohr.jpg?20211029082610",
		chaptersOfHearing
	),
	createCourse(
		2,
		"Das Wahrnehmungssystem zum Sehen",
		null,
		"Hierbei geht es um die biologischen und die neurophysiologischen/-anatomischen Grundlagen der Signalverarbeitung, den Spezifika und Prinzipien des Sehens sowie um Beispiele für die visuelle Wahrnehmung.",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Auge.png/650px-Auge.png?20060121123626",
		chaptersOfVision
	)
];

const authors = [
	createAuthor(
		"Ute Zaepernick-Rothe",
		"https://lsf.uni-hildesheim.de/qisserver/rds?state=medialoader&application=lsf&objectid=15528",
		chaptersOfHearing.concat(chaptersOfVision),
		courses
	)
];

export async function psychologyExample(): Promise<void> {
	seedCaseStudy("Psychology", courses, chaptersOfHearing, authors);
}
