import { createAuthor, seedCaseStudy } from "../seed-functions";
import * as Analysis from "./Analysis";
import * as DidacticsOfGeometry from "./DidacticsOfGeometry";

const didacticChapters = [DidacticsOfGeometry.chapters].flat();
const mathChapters = [Analysis.chapters].flat();

const didacticCourses = [DidacticsOfGeometry.course];
const mathCourses = [Analysis.course];

const authors = [
	createAuthor({
		userName: "beste-demo",
		name: "Meeri-Liisa Beste",
		imgUrl: "https://lsf.uni-hildesheim.de/qisserver/rds?state=medialoader&application=lsf&objectid=14397",
		lessons: didacticChapters,
		courses: didacticCourses
	}),
	createAuthor({
		userName: "wolffb-demo",
		name: "Bianca Wolff",
		imgUrl: "https://lsf.uni-hildesheim.de/qisserver/rds?state=medialoader&application=lsf&objectid=14411",
		lessons: didacticChapters,
		courses: didacticCourses
	}),
	createAuthor({
		userName: "veith-demo",
		name: "Joaquin Veith",
		imgUrl: "https://lsf.uni-hildesheim.de/qisserver/rds?state=medialoader&application=lsf&objectid=15414",
		lessons: mathChapters,
		courses: mathCourses
	})
];

export async function mathExample(): Promise<void> {
	await seedCaseStudy(
		"Mathematics",
		[didacticCourses, mathCourses].flat(),
		[didacticChapters, mathChapters].flat(),
		authors
	);
}
