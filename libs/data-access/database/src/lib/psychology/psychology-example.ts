import { createAuthor, seedCaseStudy } from "../seed-functions";

import * as FundamentalsOfPerception from "./FundamentalsOfPerception";
import * as PerceptionOfHearing from "./PerceptionOfHearing";
import * as PerceptionOfVision from "./PerceptionOfVision";
import * as PerceptionOfSmelling from "./PerceptionOfSmelling";
import * as PerceptionOfTasting from "./PerceptionOfTasting";
import * as FundamentalsOfAttention from "./FundamentalsOfAttention";
import * as FundamentalsOfConsciousness from "./FundamentalsOfConsciousness";

const chapters = [
	FundamentalsOfPerception.chapters,
	PerceptionOfHearing.chapters,
	PerceptionOfVision.chapters,
	PerceptionOfSmelling.chapters,
	PerceptionOfTasting.chapters,
	FundamentalsOfAttention.chapters,
	FundamentalsOfConsciousness.chapters
].flat();

const courses = [
	FundamentalsOfPerception.course,
	PerceptionOfHearing.course,
	PerceptionOfVision.course,
	PerceptionOfSmelling.course,
	PerceptionOfTasting.course,
	FundamentalsOfAttention.course,
	FundamentalsOfConsciousness.course
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
