import { createAuthor, seedCaseStudy } from "../seed-functions";

import * as FundamentalsOfPerception from "./FundamentalsOfPerception";
import * as PerceptionOfHearing from "./PerceptionOfHearing";
import * as PerceptionOfVision from "./PerceptionOfVision";

const chapters = [
	FundamentalsOfPerception.chapters,
	PerceptionOfHearing.chapters,
	PerceptionOfVision.chapters
].flat();

const courses = [
	FundamentalsOfPerception.course,
	PerceptionOfHearing.course,
	PerceptionOfVision.course
];

const authors = [
	createAuthor(
		"Ute Zaepernick-Rothe",
		"https://lsf.uni-hildesheim.de/qisserver/rds?state=medialoader&application=lsf&objectid=15528",
		chapters,
		courses
	)
];

export async function psychologyExample(): Promise<void> {
	await seedCaseStudy("Psychology", courses, chapters, authors);
}
