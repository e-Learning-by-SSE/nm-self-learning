import { createAuthor, seedCaseStudy } from "../seed-functions";
import * as Analysis from "./Analysis";
import * as DidacticsOfGeometry from "./DidacticsOfGeometry";

const didacticChapters = [DidacticsOfGeometry.chapters].flat();
const mathChapters = [Analysis.chapters].flat();

export const didacticCourses = [DidacticsOfGeometry.course];
export const mathCourses = [Analysis.course];

const authors = [
	createAuthor(
		"beste-demo",
		"Meeri-Liisa Beste",
		"https://lsf.uni-hildesheim.de/qisserver/rds?state=medialoader&application=lsf&objectid=14397",
		didacticChapters,
		didacticCourses
	),
	createAuthor(
		"wolffb-demo",
		"Bianca Wolff",
		"https://lsf.uni-hildesheim.de/qisserver/rds?state=medialoader&application=lsf&objectid=14411",
		didacticChapters,
		didacticCourses
	),
	createAuthor(
		"veith-demo",
		"Joaquin Veith",
		"https://lsf.uni-hildesheim.de/qisserver/rds?state=medialoader&application=lsf&objectid=15414",
		mathChapters,
		mathCourses
	)
];

export async function mathExample(): Promise<void> {
	await seedCaseStudy(
		"Mathematics",
		[didacticCourses, mathCourses].flat(),
		[didacticChapters, mathChapters].flat(),
		authors
	);
}
