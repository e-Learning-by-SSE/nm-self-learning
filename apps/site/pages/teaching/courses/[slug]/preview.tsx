import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";
import { CoursePreview, useEditorTabs } from "@self-learning/ui/course";
import { AuthorGuard } from "libs/ui/layouts/src/lib/guards";
import { database } from "@self-learning/database";
import {
	And,
	CompositeUnit,
	DefaultCostParameter,
	Empty,
	getPath,
	isCompositeGuard,
	LearningUnit,
	Skill,
	SkillExpression,
	Variable
} from "@e-learning-by-sse/nm-skill-lib";
import { withTranslations } from "@self-learning/api";
import { GetServerSidePropsContext } from "next";
import { DynCourseModel } from "@self-learning/teaching";
import { CourseChapter, Summary } from "@self-learning/types";
import * as ToC from "@self-learning/ui/course";
import { createCourseSummary, mapCourseContent } from "@self-learning/course";

export const getServerSideProps = withTranslations(
	["common"],
	async (ctx: GetServerSidePropsContext) => {
		const slug = ctx.params?.slug as string;

		const course = await database.dynCourse.findUniqueOrThrow({
			where: { slug },
			select: {
				title: true,
				authors: true,
				subtitle: true,
				slug: true,
				description: true,
				imgUrl: true,
				teachingGoals: {
					select: {
						id: true,
						name: true,
						description: true,
						authorId: true,
						children: { select: { id: true } }
					}
				}
			}
		});

		const dbSkills = await database.skill.findMany({
			select: {
				id: true,
				name: true,
				description: true,
				authorId: true,
				children: { select: { id: true } }
			}
		});

		const lessons = await database.lesson.findMany({
			select: {
				lessonId: true,
				requires: { select: { id: true } },
				provides: { select: { id: true } }
			}
		});

		const libSkills: Skill[] = dbSkills.map(s => ({
			id: s.id,
			children: s.children?.map(c => c.id) ?? []
		}));

		const goalLibSkills: Skill[] = (course.teachingGoals ?? []).map(g => ({
			id: g.id,
			children: g.children?.map(c => c.id) ?? []
		}));

		const findSkill = (id: string): Skill | undefined => libSkills.find(s => s.id === id);

		const convertToExpression = (skillIds?: string[]): SkillExpression => {
			if (!skillIds || skillIds.length === 0) return new Empty();
			const skills = skillIds.map(findSkill).filter((s): s is Skill => !!s);
			if (skills.length === 0) return new Empty();
			return new And(skills.map(s => new Variable(s)));
		};

		const learningUnits: LearningUnit[] = lessons.map(l => ({
			id: l.lessonId,
			requires: convertToExpression(l.requires?.map(r => r.id)),
			provides: (l.provides ?? []).map(p => findSkill(p.id)).filter((s): s is Skill => !!s),
			suggestedSkills: []
		}));

		type LU = (typeof learningUnits)[number];
		const guard: isCompositeGuard<LU> = (element): element is CompositeUnit<LU> => false;

		const path = getPath({
			skills: libSkills,
			goal: goalLibSkills,
			learningUnits,
			knowledge: [],
			fnCost: () => 1,
			isComposite: guard,
			costOptions: DefaultCostParameter
		});

		let content: ToC.Content = [];
		let summary = {};

		if (path) {
			const courseChapter = [
				{
					title: "Generated Course Content",
					description:
						"AI-generated learning path based on your current knowledge and learning goals.",
					content: path.path.map(unit => ({
						lessonId: unit.origin?.id ?? ""
					}))
				} as CourseChapter
			];
			const courseContent = courseChapter;
			content = await mapCourseContent(courseContent);
			summary = createCourseSummary(content);
		}

		return {
			props: {
				course: course,
				content: content,
				summary: summary
			}
		};
	}
);

export default function CoursePreviewPage({
	course,
	content,
	summary
}: {
	course: DynCourseModel;
	content: ToC.Content;
	summary: Summary;
}) {
	const router = useRouter();
	const params = useParams();
	const slug = params?.slug as string;
	const [selectedIndex, setSelectedIndex] = useState(3);

	const tabs = useEditorTabs();

	async function switchTab(newIndex: number) {
		setSelectedIndex(newIndex);
		const tab = tabs[newIndex];
		if (tab.path) {
			router.push(`/teaching/courses/${slug}/${tab.path}`);
		}
	}

	return (
		<AuthorGuard>
			<div className="m-3">
				<section>
					<SectionHeader title={"Kompetenzerwerbseditor"} subtitle="" />
				</section>
				<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
					{tabs.map((tab, idx) => (
						<Tab key={idx}>
							<span>{tab.label}</span>
						</Tab>
					))}
				</Tabs>
				<CoursePreview course={course} content={content} summary={summary} />
			</div>
		</AuthorGuard>
	);
}
