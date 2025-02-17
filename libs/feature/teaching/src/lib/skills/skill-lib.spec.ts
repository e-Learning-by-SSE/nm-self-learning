import {
	And,
	CompositeUnit,
	DefaultCostParameter,
	Empty,
	getPath,
	isCompositeGuard,
	SkillExpression,
	Unit,
	Variable
} from "@e-learning-by-sse/nm-skill-lib";
import { database } from "@self-learning/database";

// Copied from Skill-Lib for documentation purpose
type Skill = {
	id: string;
	repositoryId: string;
	nestedSkills: string[];
};

type LearningUnit = {
	id: string;
	requiredSkills: SkillExpression;
	teachingGoals: Skill[];
	suggestedSkills: { weight: number; skill: Skill }[];
};

describe("Skill-Lib", () => {
	// All skills of the platform, may be filtered if there is a good strategy
	let skills: Skill[];
	// All (relevant) nano modules and composites
	let nano_modules: LearningUnit[];

	beforeAll(async () => {
		skills = await loadSkills();
		nano_modules = await loadLearningUnits(skills);
	});

	describe("getPath", () => {
		// Guard to distinguish between NanoModules and Composites
		// For the moment, we treat all units as NanoModules
		const guard: isCompositeGuard<LearningUnit> = (
			element: Unit<LearningUnit>
		): element is CompositeUnit<LearningUnit> => {
			return false;
		};

		// Cost function: How to measure the cost of learning a unit.
		// Treat each unit same for now, will optimize for the minimum number (not overall time)
		const fnCost = () => 1;

		it("find path, w/o knowledge, w/o filter, w/o composites", () => {
			// Goal: Set of skills that should be learned
			const goal = skills.filter(skill => skill.id === "SK::SRL-1::A::4");

			// Knowledge: Set of skills that are already known
			const knowledge: Skill[] = [];

			const path = getPath({
				skills: skills,
				learningUnits: nano_modules,
				goal: goal,
				knowledge: knowledge,
				fnCost: fnCost,
				isComposite: guard,
				costOptions: DefaultCostParameter
			});

			expect(path).not.toBeNull();
			// Example 1, Variation A has 26 NMs
			// Example 1, Variation B has 10 NMs
			// Shorter may follow
			expect(path?.path.length).toBeLessThanOrEqual(26);
		});

		it("find path, w/o knowledge, with filter, w/o composites", () => {
			// Goal: Set of skills that should be learned
			const goal = skills.filter(skill => skill.id === "SK::SRL-1::A::4");

			// Knowledge: Set of skills that are already known
			const knowledge: Skill[] = [];

			// Selector: Chooses NMs based on ID (in reality other properties should be more appropriate)
			// Filter for variation A
			const selector = (unit: LearningUnit) => {
				return unit.id.startsWith("LU::SRL-1::A::");
			};

			const path = getPath({
				skills: skills,
				learningUnits: nano_modules,
				goal: goal,
				knowledge: knowledge,
				fnCost: fnCost,
				isComposite: guard,
				costOptions: DefaultCostParameter,
				selectors: [selector]
			});

			expect(path).not.toBeNull();
			// Example 1, Variation A has 26 NMs
			// Example 1, Variation B has 10 NMs (should be excluded by selector)
			expect(path?.path.length).toBe(26);
		});

		it("find path, with knowledge, with filter, w/o composites", () => {
			// Goal: Set of skills that should be learned
			const goal = skills.filter(skill => skill.id === "SK::SRL-1::A::4");

			// Knowledge: Set of skills that are already known
			const knowledge = skills.filter(
				skill => skill.id === "SK::SRL-1::A::6" || skill.id === "SK::SRL-1::A::7"
			);

			// Selector: Chooses NMs based on ID (in reality other properties should be more appropriate)
			// Filter for variation A
			const selector = (unit: LearningUnit) => {
				return unit.id.startsWith("LU::SRL-1::A::");
			};

			const path = getPath({
				skills: skills,
				learningUnits: nano_modules,
				goal: goal,
				knowledge: knowledge,
				fnCost: fnCost,
				isComposite: guard,
				costOptions: DefaultCostParameter,
				selectors: [selector]
			});

			expect(path).not.toBeNull();
			// Example 1, Variation A has 26 NMs (2 Skills <-> NMs already known)
			// Example 1, Variation B has 10 NMs (should be excluded by selector)
			expect(path?.path.length).toBe(24);
		});
	});
});

async function loadSkills(): Promise<Skill[]> {
	// All skills of the platform, may be filtered if there is a good strategy
	const skills = (await database.skill.findMany({ include: { children: true } })).map(skill => ({
		id: skill.id,
		repositoryId: skill.repositoryId,
		nestedSkills: skill.children.map(child => child.id)
	}));

	return skills;
}

async function loadLearningUnits(allSkills: Skill[]): Promise<LearningUnit[]> {
	const findSkill = (id: string) => allSkills.find(skill => skill.id === id);
	const convertToExpression = (skills: { id: string }[]) =>
		skills && skills.length > 0
			? new And(
					skills
						.map(skill => findSkill(skill.id))
						.filter((s): s is Skill => s !== undefined)
						.map(skill => new Variable(skill))
				)
			: new Empty();

	// All (relevant) nano modules and composites
	const nano_modules: LearningUnit[] = (
		await database.lesson.findMany({
			include: { requirements: true, teachingGoals: true }
		})
	).map(lesson => ({
		id: lesson.lessonId,
		requiredSkills: convertToExpression(lesson.requirements),
		teachingGoals: lesson.teachingGoals
			.map(goal => findSkill(goal.id))
			.filter((s): s is Skill => s !== undefined),
		suggestedSkills: []
	}));

	return nano_modules;
}
