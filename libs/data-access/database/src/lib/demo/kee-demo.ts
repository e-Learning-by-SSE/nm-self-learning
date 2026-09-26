import { AccessLevel, PrismaClient } from "@prisma/client";
import { slugify } from "@self-learning/util/common";
import { softwareentwicklungDemoGroup } from "../seedSpecializations";
import { CourseContent, createCourseMeta } from "@self-learning/types";
import { createLesson } from "../seed-functions";

const prisma = new PrismaClient();

type Skill = {
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

type DynamicCourse = {
	courseId: string;
	title: string;
	requires?: string[];
	provides: string[];
};

const skills: Skill[] = [
	{
		id: "SK::PW",
		name: "Paper Work"
	},
	{
		id: "SK::PW::Writing",
		name: "Writing",
		parents: ["SK::PW"]
	},
	{
		id: "SK::PW::Writing::Structure",
		name: "Structure",
		parents: ["SK::PW::Writing"]
	},
	{
		id: "SK::PW::Writing::Evidence",
		name: "Evidence",
		parents: ["SK::PW::Writing"]
	},
	{
		id: "SK::PW::Writing::Citations",
		name: "Foundation of Citing",
		parents: ["SK::PW::Writing"]
	},
	{
		id: "SK::PW::Research",
		name: "Research",
		parents: ["SK::PW"]
	},
	{
		id: "SK::PW::Research::Search",
		name: "Searching",
		parents: ["SK::PW::Research"]
	},
	{
		id: "SK::PW::Research::Reading",
		name: "Reading",
		parents: ["SK::PW::Research"]
	},
	{
		id: "SK::PW::Presenting",
		name: "Presenting",
		parents: ["SK::PW"]
	},
	{
		id: "SK::Citing",
		name: "Citing"
	},
	{
		id: "SK::Citing::CS",
		name: "Citing in Computer Science",
		parents: ["SK::Citing"]
	},
	{
		id: "SK::Citing::Economics",
		name: "Citing in Economics",
		parents: ["SK::Citing"]
	}
];

const units: LearningUnit[] = [
	{
		lessonId: "LU::PW::Research::Search",
		title: "How to Search for Research Material",
		provides: ["SK::PW::Research::Search"]
	},
	{
		lessonId: "LU::PW::Research::Reading",
		title: "How to Read Research Material",
		provides: ["SK::PW::Research::Reading"]
	},
	{
		lessonId: "LU::PW::Writing::Structure",
		title: "How to Structure Your Paper",
		provides: ["SK::PW::Writing::Structure"]
	},
	{
		lessonId: "LU::PW::Writing::Evidence",
		title: "Ensure Chain of Evidence",
		provides: ["SK::PW::Writing::Evidence"],
		requires: ["SK::PW::Writing::Structure"]
	},
	{
		lessonId: "LU::PW::Writing::Citations",
		title: "Foundation of Citing",
		provides: ["SK::PW::Writing::Citations"]
	},
	{
		lessonId: "LU::PW::Presenting",
		title: "How to Present Your Paper",
		provides: ["SK::PW::Presenting"]
	},
	{
		lessonId: "LU::Citing::CS",
		title: "Citing in Computer Science",
		provides: ["SK::Citing::CS"],
		requires: ["SK::Citing"]
	},
	{
		lessonId: "LU::Citing::Economics",
		title: "Citing in Economics",
		provides: ["SK::Citing::Economics"],
		requires: ["SK::Citing"]
	}
];

const dynCourses: DynamicCourse[] = [
	{
		courseId: "DC::Example::Seminar::CS",
		title: "Example Seminar in Computer Science",
		provides: ["SK::PW::Research", "SK::PW::Writing", "SK::PW::Presenting", "SK::Citing::CS"]
	},
	{
		courseId: "DC::Example::Seminar::Economics",
		title: "Example Seminar in Economics",
		provides: [
			"SK::PW::Research",
			"SK::PW::Writing",
			"SK::PW::Presenting",
			"SK::Citing::Economics"
		]
	}
];

export async function seedSkillbasedSeminars() {
	console.log("\x1b[94m%s\x1b[0m", "Skill-based Modelling Seminar-Example:");

	console.log(" - %s\x1b[32m ✔\x1b[0m", "Authors");

	for (const skill of skills) {
		await prisma.skill.create({
			data: {
				id: skill.id,
				name: skill.name,
				author: { connect: { username: "dumbledore" } },
				parents: {
					connect: skill.parents?.map(id => ({ id })) || []
				}
			}
		});
	}
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Skills");

	const group = await prisma.group.findUniqueOrThrow({
		where: {
			name: softwareentwicklungDemoGroup.name
		}
	});

	for (const unit of units) {
		const lesson = createLesson({
			...unit,
			subtitle: null,
			description: null,
			content: [],
			questions: [],
			permissions: [
				{
					groupId: group.id,
					accessLevel: AccessLevel.FULL
				}
			]
		});
		await prisma.lesson.create({ data: lesson });
	}
	console.log(" - %s\x1b[32m ✔\x1b[0m", "Nanomodules of Seminar-Example");

	for (const course of dynCourses) {
		const content: CourseContent = [
			{
				title: "",
				description: "",
				content: units.map(unit => ({ lessonId: unit.lessonId }))
			}
		];
		await prisma.course.create({
			data: {
				title: course.title,
				subtitle: "",
				version: "1.0",
				courseId: course.courseId,
				slug: slugify(course.title),
				type: "DYNAMIC",
				content,
				meta: createCourseMeta({ content }),
				requires: {
					connect: course.requires?.map(id => ({ id })) || []
				},
				provides: {
					connect: course.provides?.map(id => ({ id })) || []
				},
				permissions: {
					create: {
						group: {
							connect: {
								id: group.id
							}
						},
						accessLevel: AccessLevel.FULL
					}
				}
			}
		});
	}
}
