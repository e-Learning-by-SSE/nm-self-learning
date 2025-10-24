import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";
import { useEditorTabs } from "@self-learning/ui/course";
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
	Path,
	Skill,
	SkillExpression,
	Variable
} from "@e-learning-by-sse/nm-skill-lib";

interface SerializedSkill {
	id: string;
	children: string[];
}

interface SerializedExpression {
	type: string;
}

interface SerializedLearningUnit {
	id: string;
	requires: SerializedExpression | null;
	provides: SerializedSkill[];
	suggestedSkills: { weight: number; skill: SerializedSkill }[];
}
interface SerializedPath {
	cost: number;
	origin: SerializedLearningUnit | null;
	path: SerializedPath[];
}

export const getServerSideProps = async (ctx: { params: { slug: string } }) => {
	const slug = ctx.params?.slug as string;

	const course = await database.dynCourse.findUniqueOrThrow({
		where: { slug },
		select: {
			slug: true,
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

	const serializeExpression = (expr: unknown): SerializedExpression | null => {
		if (!expr) return null;
		const typeName =
			(expr as { constructor?: { name?: string } }).constructor?.name ?? "Unknown";
		return { type: typeName };
	};

	const serializeSkill = (skill: Skill): SerializedSkill => ({
		id: skill.id,
		children: skill.children ?? []
	});

	const serializeLearningUnit = (lu: LearningUnit): SerializedLearningUnit => ({
		id: lu.id,
		requires: serializeExpression(lu.requires),
		provides: lu.provides.map(serializeSkill),
		suggestedSkills: lu.suggestedSkills.map(s => ({
			weight: s.weight,
			skill: serializeSkill(s.skill)
		}))
	});

	const serializePath = (p: Path<LU>): SerializedPath => ({
		cost: p.cost,
		origin: p.origin ? serializeLearningUnit(p.origin) : null,
		path: p.path.map(serializePath)
	});

	return {
		props: {
			path: path ? serializePath(path) : []
		}
	};
};

export default function CoursePreviewPage({ path }: { path: SerializedPath[] }) {
	const router = useRouter();
	const params = useParams();
	const slug = params?.slug as string;
	const [selectedIndex, setSelectedIndex] = useState(3);
	console.log("path", path);

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
				<div className="w-full h-[100px] flex items-center justify-center">
					<div className="font-mono whitespace-pre text-sm pt-5">
						{`  ^__^
 (oo)\\_______
(__)\\       )\\/\\
    ||----- |
    ||     ||`}
					</div>
				</div>
			</div>
		</AuthorGuard>
	);
}
