import {
	And,
	CompositeUnit,
	DefaultCostParameter,
	Empty,
	getPath,
	isCompositeGuard,
	LearningUnit,
	Unit,
	Variable
} from "@e-learning-by-sse/nm-skill-lib";
import { database } from "@self-learning/database";
import { CourseLesson } from "@self-learning/types";

/**
 *
 * @param param0
 * @returns
 */
export async function resolveLessonPath({
	courseProvides,
	userKnowledgeIds = []
}: {
	courseProvides: { id: string; children?: { id: string }[] }[];
	userKnowledgeIds?: string[];
}): Promise<CourseLesson[] | null> {
	const [dbSkills, lessons] = await Promise.all([
		database.skill.findMany({
			select: {
				id: true,
				children: { select: { id: true } }
			}
		}),
		database.lesson.findMany({
			select: {
				lessonId: true,
				requires: { select: { id: true } },
				provides: { select: { id: true } }
			}
		})
	]);

	const libSkills = dbSkills.map(s => ({
		id: s.id,
		children: s.children?.map(c => c.id) ?? []
	}));

	const goalLibSkills = (courseProvides ?? []).map(g => ({
		id: g.id,
		children: g.children?.map(c => c.id) ?? []
	}));

	const findSkill = (id: string) => libSkills.find(s => s.id === id);

	const knowledgeLibSkills = userKnowledgeIds
		.map(findSkill)
		.filter((s): s is (typeof libSkills)[number] => !!s);

	const convertToExpression = (skillIds?: string[]) => {
		if (!skillIds || skillIds.length === 0) return new Empty();
		const skills = skillIds.map(findSkill).filter((s): s is (typeof libSkills)[number] => !!s);
		if (skills.length === 0) return new Empty();
		return new And(skills.map(s => new Variable(s)));
	};

	const learningUnits: LearningUnit[] = lessons.map(l => ({
		id: l.lessonId,
		requires: convertToExpression(l.requires?.map(r => r.id)),
		provides: (l.provides ?? [])
			.map(p => findSkill(p.id))
			.filter((s): s is (typeof libSkills)[number] => !!s),
		suggestedSkills: []
	}));

	const guard: isCompositeGuard<LearningUnit> = (
		_element: Unit<LearningUnit>
	): _element is CompositeUnit<LearningUnit> => {
		return false;
	};

	const pathResult = getPath({
		skills: libSkills,
		learningUnits,
		goal: goalLibSkills,
		knowledge: knowledgeLibSkills,
		fnCost: () => 1,
		isComposite: guard,
		costOptions: DefaultCostParameter
	});

	if (!pathResult?.path) return null;

	return pathResult.path.map(unit => ({
		lessonId: unit.origin?.id ?? ""
	}));
}
