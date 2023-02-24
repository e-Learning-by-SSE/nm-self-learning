import { createAuthor, seedCaseStudy } from "../seed-functions";

import * as FundamentalsOfPerception from "./FundamentalsOfPerception";
import * as PerceptionOfHearing from "./PerceptionOfHearing";
import * as PerceptionOfVision from "./PerceptionOfVision";
import * as PerceptionOfSmelling from "./PerceptionOfSmelling";
//import * as PerceptionOfTasting from "./PerceptionOfTasting";
import * as FundermentalOfAttention from "./FundamentalsOfAttention";

const chapters = [
	FundamentalsOfPerception.chapters,
	PerceptionOfHearing.chapters,
	PerceptionOfVision.chapters,
	PerceptionOfSmelling.chapters,
	//PerceptionOfTasting.chapters,
	FundermentalOfAttention.chapters
].flat();

const courses = [
	FundamentalsOfPerception.course,
	PerceptionOfHearing.course,
	PerceptionOfVision.course,
	PerceptionOfSmelling.course,
	//PerceptionOfTasting.course,
	FundermentalOfAttention.course
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
