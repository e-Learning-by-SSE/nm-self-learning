import { Prisma, PrismaClient, SkillRepository } from "@prisma/client";
import { slugify } from "@self-learning/util/common";

const prisma = new PrismaClient();

type SkillOfRepository = {
	id: string;
	name: string;
	parents?: string[];
};

type LearningUnit = {
	lessonId: string;
	title: string;
	requires?: string[];
	provides: string[];
};

const authors: Prisma.UserCreateInput[] = [
	{
		name: "slr-author_1",
		displayName: "Jane Doe",
		author: {
			create: {
				displayName: "Jane Doe",
				slug: "slr-author_1"
			}
		}
	}
];

const repositories: SkillRepository[] = [
	{
		id: "SK-Repository::SRL::1-A",
		name: "Self-Regulated Learning (Example 1, Version A)",
		description: "Self-Regulated Learning (Example 1, Version A)",
		ownerName: authors[0].name
	}
];

/**
 * Example 1, Variation A:
 * Selbstreguliertes Lernen
 * ├── Bedeutung: Selbstreguliertes Lernen
 * ├── Bedeutung: Eigenverantwortung
 * ├── SLR als mehrschrittiger zyklischer Prozess
 * ├── Präaktionale Phase
 * │   ├── Definition: Präaktionale Phase
 * │   ├── Bedeutung: Zielsetzung & Planung
 * │   ├── Ziele
 * │   │   ├── SMART-Methode
 * │   │   └── Eisenhower-Prinzip
 * │   ├── Zeitmanagement
 * │   │   ├── Überblick über die Lernzeit
 * │   │   └── Methoden des Zeitmanagements
 * │   │       ├── Gantt-Diagramm
 * │   │       ├── ALPEN-Methode
 * │   │       └── Verteiltes Lernen
 * │   └── Motivation & Prokrastination
 * ├── Aktionale Phase
 * │   ├── Effektive Nutzung der Lernzeit
 * |   ├── Verwendung von Lernstrategien
 * │       ├── Bedeutung: Lernstrategien
 * │       ├── Lernstrategien
 * |       │   ├── Kognitive Lernstrategien
 * │       │   ├── Elaboration
 * │       │   ├── Wiederholung
 * │       │   ├── Organisation
 * |       │   └── Metakognitiv
 * │       └── Aspekte von Lernstrategien
 * │           ├── Aufmerksamkeit
 * │           ├── Ressourcemanagement
 * │           ├── Anstrengungsmanagement
 * │           ├── Prüfungsangst
 * │           ├── Prüfungsstress
 * │           └── Arbeiten mit Nanomodulen
 * └── Postaktionale Phase
 *     └── Reflexion
 */
export const skills: SkillOfRepository[] = [
	{
		id: "SK::SRL-1::A::1",
		name: "Selbstreguliertes Lernen"
	},
	{
		id: "SK::SRL-1::A::2",
		name: "Bedeutung: Selbstreguliertes Lernen"
	},
	{
		id: "SK::SRL-1::A::3",
		name: "Bedeutung: Eigenverantwortung"
	},
	{
		id: "SK::SRL-1::A::4",
		name: "SLR als mehrschrittiger zyklischer Prozess"
	},
	{
		id: "SK::SRL-1::A::5",
		name: "Präaktionale Phase"
	},
	{
		id: "SK::SRL-1::A::6",
		name: "Definition: Präaktionale Phase",
		parents: ["SK::SRL-1::A::5"]
	},
	{
		id: "SK::SRL-1::A::7",
		name: "Bedeutung: Zielsetzung & Planung",
		parents: ["SK::SRL-1::A::5"]
	},
	{
		id: "SK::SRL-1::A::8",
		name: "Ziele",
		parents: ["SK::SRL-1::A::5"]
	},
	{
		id: "SK::SRL-1::A::9",
		name: "SMART-Methode",
		parents: ["SK::SRL-1::A::8"]
	},
	{
		id: "SK::SRL-1::A::10",
		name: "Eisenhower-Prinzip",
		parents: ["SK::SRL-1::A::8"]
	},
	{
		id: "SK::SRL-1::A::11",
		name: "Zeitmanagement",
		parents: ["SK::SRL-1::A::5"]
	},
	{
		id: "SK::SRL-1::A::12",
		name: "Überblick über die Lernzeit",
		parents: ["SK::SRL-1::A::11"]
	},
	{
		id: "SK::SRL-1::A::13",
		name: "Methoden des Zeitmanagements",
		parents: ["SK::SRL-1::A::11"]
	},
	{
		id: "SK::SRL-1::A::14",
		name: "Gantt-Diagramm",
		parents: ["SK::SRL-1::A::13"]
	},
	{
		id: "SK::SRL-1::A::15",
		name: "ALPEN-Methode",
		parents: ["SK::SRL-1::A::13"]
	},
	{
		id: "SK::SRL-1::A::16",
		name: "Verteiltes Lernen",
		parents: ["SK::SRL-1::A::13"]
	},
	{
		id: "SK::SRL-1::A::17",
		name: "Motivation & Prokrastination",
		parents: ["SK::SRL-1::A::5"]
	},
	{
		id: "SK::SRL-1::A::18",
		name: "Aktionale Phase"
	},
	{
		id: "SK::SRL-1::A::19",
		name: "Effektive Nutzung der Lernzeit",
		parents: ["SK::SRL-1::A::18"]
	},
	{
		id: "SK::SRL-1::A::20",
		name: "Verwendung von Lernstrategien",
		parents: ["SK::SRL-1::A::18"]
	},
	{
		id: "SK::SRL-1::A::21",
		name: "Bedeutung: Lernstrategien",
		parents: ["SK::SRL-1::A::20"]
	},
	{
		id: "SK::SRL-1::A::22",
		name: "Lernstrategien",
		parents: ["SK::SRL-1::A::20"]
	},
	{
		id: "SK::SRL-1::A::23",
		name: "Kognitive Lernstrategien",
		parents: ["SK::SRL-1::A::22"]
	},
	{
		id: "SK::SRL-1::A::24",
		name: "Elaboration",
		parents: ["SK::SRL-1::A::22"]
	},
	{
		id: "SK::SRL-1::A::25",
		name: "Wiederholung",
		parents: ["SK::SRL-1::A::22"]
	},
	{
		id: "SK::SRL-1::A::26",
		name: "Organisation",
		parents: ["SK::SRL-1::A::22"]
	},
	{
		id: "SK::SRL-1::A::27",
		name: "Metakognitiv",
		parents: ["SK::SRL-1::A::22"]
	},
	{
		id: "SK::SRL-1::A::28",
		name: "Aspekte von Lernstrategien",
		parents: ["SK::SRL-1::A::20"]
	},
	{
		id: "SK::SRL-1::A::29",
		name: "Aufmerksamkeit",
		parents: ["SK::SRL-1::A::28"]
	},
	{
		id: "SK::SRL-1::A::30",
		name: "Ressourcemanagement",
		parents: ["SK::SRL-1::A::28"]
	},
	{
		id: "SK::SRL-1::A::31",
		name: "Anstrengungsmanagement",
		parents: ["SK::SRL-1::A::28"]
	},
	{
		id: "SK::SRL-1::A::32",
		name: "Prüfungsangst",
		parents: ["SK::SRL-1::A::28"]
	},
	{
		id: "SK::SRL-1::A::33",
		name: "Prüfungsstress",
		parents: ["SK::SRL-1::A::28"]
	},
	{
		id: "SK::SRL-1::A::34",
		name: "Arbeiten mit Nanomodulen",
		parents: ["SK::SRL-1::A::28"]
	},
	{
		id: "SK::SRL-1::A::35",
		name: "Postaktionale Phase"
	},
	{
		id: "SK::SRL-1::A::36",
		name: "Reflexion",
		parents: ["SK::SRL-1::A::35"]
	}
];

export const unitsOfExample1A: LearningUnit[] = [
	{
		lessonId: "LU::SRL-1::A::1",
		title: "Bedeutung: Selbstreguliertes Lernen",
		provides: ["SK::SRL-1::A::2"]
	},
	{
		lessonId: "LU::SRL-1::A::2",
		title: "Bedeutung: Eigenverantwortung",
		provides: ["SK::SRL-1::A::3"]
	},
	{
		lessonId: "LU::SRL-1::A::3",
		title: "SLR als mehrschrittiger zyklischer Prozess",
		requires: [
			// Präaktionale Phase
			"SK::SRL-1::A::6",
			"SK::SRL-1::A::7",
			"SK::SRL-1::A::9",
			"SK::SRL-1::A::10",
			"SK::SRL-1::A::12",
			"SK::SRL-1::A::14",
			"SK::SRL-1::A::15",
			"SK::SRL-1::A::16",
			"SK::SRL-1::A::17",
			// Aktionale Phase
			"SK::SRL-1::A::19",
			"SK::SRL-1::A::21",
			"SK::SRL-1::A::23",
			"SK::SRL-1::A::24",
			"SK::SRL-1::A::25",
			"SK::SRL-1::A::26",
			"SK::SRL-1::A::27",
			"SK::SRL-1::A::29",
			"SK::SRL-1::A::30",
			"SK::SRL-1::A::31",
			"SK::SRL-1::A::32",
			"SK::SRL-1::A::33",
			"SK::SRL-1::A::34",
			// Postaktionale Phase
			"SK::SRL-1::A::36"
		],
		provides: ["SK::SRL-1::A::4"]
	},
	// Präaktionale Phase
	{
		lessonId: "LU::SRL-1::A::4",
		title: "Definition: Präaktionale Phase",
		requires: ["SK::SRL-1::A::2", "SK::SRL-1::A::3"],
		provides: ["SK::SRL-1::A::6"]
	},
	{
		lessonId: "LU::SRL-1::A::5",
		title: "Bedeutung: Zielsetzung & Planung",
		requires: ["SK::SRL-1::A::6"],
		provides: ["SK::SRL-1::A::7"]
	},
	{
		lessonId: "LU::SRL-1::A::6",
		title: "SMART-Methode",
		requires: ["SK::SRL-1::A::6", "SK::SRL-1::A::7"],
		provides: ["SK::SRL-1::A::9"]
	},
	{
		lessonId: "LU::SRL-1::A::7",
		title: "Eisenhower-Prinzip",
		requires: ["SK::SRL-1::A::6", "SK::SRL-1::A::7"],
		provides: ["SK::SRL-1::A::10"]
	},
	{
		lessonId: "LU::SRL-1::A::8",
		title: "Überblick über die Lernzeit",
		requires: ["SK::SRL-1::A::6", "SK::SRL-1::A::7"],
		provides: ["SK::SRL-1::A::12"]
	},
	{
		lessonId: "LU::SRL-1::A::9",
		title: "Gantt-Diagramm",
		requires: ["SK::SRL-1::A::12"],
		provides: ["SK::SRL-1::A::14"]
	},
	{
		lessonId: "LU::SRL-1::A::10",
		title: "Alpen-Methode",
		requires: ["SK::SRL-1::A::12"],
		provides: ["SK::SRL-1::A::15"]
	},
	{
		lessonId: "LU::SRL-1::A::11",
		title: "Verteiltes Lernen",
		requires: ["SK::SRL-1::A::12"],
		provides: ["SK::SRL-1::A::16"]
	},
	{
		lessonId: "LU::SRL-1::A::12",
		title: "Motivation & Prokrastination",
		requires: [
			"SK::SRL-1::A::6",
			"SK::SRL-1::A::7",
			"SK::SRL-1::A::9",
			"SK::SRL-1::A::10",
			"SK::SRL-1::A::12"
		],
		provides: ["SK::SRL-1::A::17"]
	},
	// Aktionale Phase
	{
		lessonId: "LU::SRL-1::A::13",
		title: "Lernzeit effektiv nutzen",
		requires: [
			"SK::SRL-1::A::2",
			"SK::SRL-1::A::3",
			// Präaktionale Phase
			"SK::SRL-1::A::6",
			"SK::SRL-1::A::7",
			"SK::SRL-1::A::9",
			"SK::SRL-1::A::10",
			"SK::SRL-1::A::12",
			"SK::SRL-1::A::14",
			"SK::SRL-1::A::15",
			"SK::SRL-1::A::16",
			"SK::SRL-1::A::17"
		],
		provides: ["SK::SRL-1::A::19"]
	},
	{
		lessonId: "LU::SRL-1::A::14",
		title: "Bedeutung: Lernstrategien",
		requires: ["SK::SRL-1::A::19"],
		provides: ["SK::SRL-1::A::21"]
	},
	// Aktionale Phase -> Lernstrategien
	{
		lessonId: "LU::SRL-1::A::15",
		title: "Kognitive Lernstrategien",
		requires: ["SK::SRL-1::A::21"],
		provides: ["SK::SRL-1::A::23"]
	},
	{
		lessonId: "LU::SRL-1::A::16",
		title: "Elaboration",
		requires: ["SK::SRL-1::A::21"],
		provides: ["SK::SRL-1::A::24"]
	},
	{
		lessonId: "LU::SRL-1::A::17",
		title: "Wiederhollungen",
		requires: ["SK::SRL-1::A::21"],
		provides: ["SK::SRL-1::A::25"]
	},
	{
		lessonId: "LU::SRL-1::A::18",
		title: "Organisation",
		requires: ["SK::SRL-1::A::21"],
		provides: ["SK::SRL-1::A::26"]
	},
	{
		lessonId: "LU::SRL-1::A::19",
		title: "Metakognitive Lernstrategien",
		requires: ["SK::SRL-1::A::21"],
		provides: ["SK::SRL-1::A::27"]
	},
	// Aktionale Phase -> Aspekte von Lernstrategien
	{
		lessonId: "LU::SRL-1::A::20",
		title: "Aufmerksamkeit",
		requires: ["SK::SRL-1::A::21"],
		provides: ["SK::SRL-1::A::29"]
	},
	{
		lessonId: "LU::SRL-1::A::21",
		title: "Ressourcemanagement",
		requires: ["SK::SRL-1::A::21"],
		provides: ["SK::SRL-1::A::30"]
	},
	{
		lessonId: "LU::SRL-1::A::22",
		title: "Anstrengungsmanagement",
		requires: ["SK::SRL-1::A::21"],
		provides: ["SK::SRL-1::A::31"]
	},
	{
		lessonId: "LU::SRL-1::A::23",
		title: "Prüfungsangst",
		requires: ["SK::SRL-1::A::21"],
		provides: ["SK::SRL-1::A::32"]
	},
	{
		lessonId: "LU::SRL-1::A::24",
		title: "Prüfungsstress",
		requires: ["SK::SRL-1::A::21"],
		provides: ["SK::SRL-1::A::33"]
	},
	{
		lessonId: "LU::SRL-1::A::25",
		title: "Arbeiten mit Nanomodulen",
		requires: ["SK::SRL-1::A::21"],
		provides: ["SK::SRL-1::A::34"]
	},
	// Postaktionale Phase
	{
		lessonId: "LU::SRL-1::A::26",
		title: "Reflexion",
		requires: [
			// Präaktionale Phase
			"SK::SRL-1::A::6",
			"SK::SRL-1::A::7",
			"SK::SRL-1::A::9",
			"SK::SRL-1::A::10",
			"SK::SRL-1::A::12",
			"SK::SRL-1::A::14",
			"SK::SRL-1::A::15",
			"SK::SRL-1::A::16",
			"SK::SRL-1::A::17",
			// Aktionale Phase
			"SK::SRL-1::A::19",
			"SK::SRL-1::A::21",
			"SK::SRL-1::A::23",
			"SK::SRL-1::A::24",
			"SK::SRL-1::A::25",
			"SK::SRL-1::A::26",
			"SK::SRL-1::A::27",
			"SK::SRL-1::A::29",
			"SK::SRL-1::A::30",
			"SK::SRL-1::A::31",
			"SK::SRL-1::A::32",
			"SK::SRL-1::A::33",
			"SK::SRL-1::A::34"
		],
		provides: ["SK::SRL-1::A::36"]
	}
];
export const unitsOfExample1B: LearningUnit[] = [
	{
		lessonId: "LU::SRL-1::B::1",
		title: "Einführungs: Selbstreguliertes Lernen",
		provides: ["SK::SRL-1::A::2", "SK::SRL-1::A::3"]
	},
	{
		lessonId: "LU::SRL-1::B::10",
		title: "SLR als mehrschrittiger zyklischer Prozess",
		requires: [
			// Präaktionale Phase
			"SK::SRL-1::A::6",
			"SK::SRL-1::A::7",
			"SK::SRL-1::A::9",
			"SK::SRL-1::A::10",
			"SK::SRL-1::A::12",
			"SK::SRL-1::A::14",
			"SK::SRL-1::A::15",
			"SK::SRL-1::A::16",
			"SK::SRL-1::A::17",
			// Aktionale Phase
			"SK::SRL-1::A::19",
			"SK::SRL-1::A::21",
			"SK::SRL-1::A::23",
			"SK::SRL-1::A::24",
			"SK::SRL-1::A::25",
			"SK::SRL-1::A::26",
			"SK::SRL-1::A::27",
			"SK::SRL-1::A::29",
			"SK::SRL-1::A::30",
			"SK::SRL-1::A::31",
			"SK::SRL-1::A::32",
			"SK::SRL-1::A::33",
			"SK::SRL-1::A::34",
			// Postaktionale Phase
			"SK::SRL-1::A::36"
		],
		provides: ["SK::SRL-1::A::4"]
	},
	// Präaktionale Phase
	{
		lessonId: "LU::SRL-1::B::2",
		title: "Einführung: Präaktionale Phase",
		requires: ["SK::SRL-1::A::2", "SK::SRL-1::A::3"],
		provides: ["SK::SRL-1::A::6", "SK::SRL-1::A::7"]
	},
	{
		lessonId: "LU::SRL-1::B::3",
		title: "Ziele",
		requires: ["SK::SRL-1::A::6", "SK::SRL-1::A::7"],
		provides: ["SK::SRL-1::A::8", "SK::SRL-1::A::9", "SK::SRL-1::A::10"]
	},
	{
		lessonId: "LU::SRL-1::B::4",
		title: "Zeitmanagement",
		requires: [
			"SK::SRL-1::A::6",
			"SK::SRL-1::A::7",
			"SK::SRL-1::A::8",
			"SK::SRL-1::A::9",
			"SK::SRL-1::A::10"
		],
		provides: [
			"SK::SRL-1::A::11",
			"SK::SRL-1::A::12",
			"SK::SRL-1::A::13",
			"SK::SRL-1::A::14",
			"SK::SRL-1::A::15",
			"SK::SRL-1::A::16"
		]
	},
	{
		lessonId: "LU::SRL-1::B::5",
		title: "Motivation & Prokrastination",
		requires: ["SK::SRL-1::A::4", "SK::SRL-1::A::5", "SK::SRL-1::A::8", "SK::SRL-1::A::11"],
		provides: ["SK::SRL-1::A::17"]
	},
	// Aktionale Phase
	{
		lessonId: "LU::SRL-1::B::6",
		title: "Einführung Aktionale Phase",
		requires: [
			"SK::SRL-1::A::2",
			"SK::SRL-1::A::3",
			// Präaktionale Phase
			"SK::SRL-1::A::6",
			"SK::SRL-1::A::7",
			"SK::SRL-1::A::9",
			"SK::SRL-1::A::10",
			"SK::SRL-1::A::12",
			"SK::SRL-1::A::14",
			"SK::SRL-1::A::15",
			"SK::SRL-1::A::16",
			"SK::SRL-1::A::17"
		],
		provides: ["SK::SRL-1::A::19"]
	},
	{
		lessonId: "LU::SRL-1::B::7",
		title: "Lernstrategien",
		requires: ["SK::SRL-1::A::19"],
		provides: [
			"SK::SRL-1::A::20",
			"SK::SRL-1::A::21",
			"SK::SRL-1::A::22",
			"SK::SRL-1::A::23",
			"SK::SRL-1::A::24",
			"SK::SRL-1::A::25",
			"SK::SRL-1::A::26",
			"SK::SRL-1::A::27"
		]
	},
	{
		lessonId: "LU::SRL-1::B::8",
		title: "Aspekte von Lernstrategien",
		requires: ["SK::SRL-1::A::19", "SK::SRL-1::A::21"],
		provides: [
			"SK::SRL-1::A::28",
			"SK::SRL-1::A::29",
			"SK::SRL-1::A::30",
			"SK::SRL-1::A::31",
			"SK::SRL-1::A::32",
			"SK::SRL-1::A::33",
			"SK::SRL-1::A::34"
		]
	},
	// Postaktionale Phase
	{
		lessonId: "LU::SRL-1::B::9",
		title: "Postaktionale Phase",
		requires: [
			// Präaktionale Phase
			"SK::SRL-1::A::6",
			"SK::SRL-1::A::7",
			"SK::SRL-1::A::9",
			"SK::SRL-1::A::10",
			"SK::SRL-1::A::12",
			"SK::SRL-1::A::14",
			"SK::SRL-1::A::15",
			"SK::SRL-1::A::16",
			"SK::SRL-1::A::17",
			// Aktionale Phase
			"SK::SRL-1::A::19",
			"SK::SRL-1::A::21",
			"SK::SRL-1::A::23",
			"SK::SRL-1::A::24",
			"SK::SRL-1::A::25",
			"SK::SRL-1::A::26",
			"SK::SRL-1::A::27",
			"SK::SRL-1::A::29",
			"SK::SRL-1::A::30",
			"SK::SRL-1::A::31",
			"SK::SRL-1::A::32",
			"SK::SRL-1::A::33",
			"SK::SRL-1::A::34"
		],
		provides: ["SK::SRL-1::A::35", "SK::SRL-1::A::36"]
	}
];

export async function seedSkillbasedModelling() {
	console.log("\x1b[94m%s\x1b[0m", "Skill-based Modelling Example:");

	for (const author of authors) {
		await prisma.user.create({
			data: author
		});
	}
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Authors");

	await prisma.skillRepository.createMany({
		data: repositories
	});
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Skill Repositories");

	for (const skill of skills) {
		await prisma.skill.create({
			data: {
				id: skill.id,
				name: skill.name,
				repositoryId: repositories[0].id
			}
		});
	}
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Skills");

	for (const unit of unitsOfExample1A) {
		await prisma.lesson.create({
			data: {
				title: unit.title,
				lessonId: unit.lessonId,
				requires: {
					connect: unit.requires?.map(id => ({ id })) || []
				},
				provides: {
					connect: unit.provides.map(id => ({ id }))
				},
				slug: slugify(unit.title),
				content: Prisma.JsonNull,
				meta: Prisma.JsonNull
			}
		});
	}
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Nanomodules of Example 1-A");

	for (const unit of unitsOfExample1B) {
		await prisma.lesson.create({
			data: {
				title: unit.title,
				lessonId: unit.lessonId,
				requires: {
					connect: unit.requires?.map(id => ({ id })) || []
				},
				provides: {
					connect: unit.provides.map(id => ({ id }))
				},
				slug: slugify(unit.lessonId),
				content: Prisma.JsonNull,
				meta: Prisma.JsonNull
			}
		});
	}
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Nanomodules of Example 1-B");
}
