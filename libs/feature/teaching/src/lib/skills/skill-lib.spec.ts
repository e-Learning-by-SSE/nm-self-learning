import {
	And,
	CompositeUnit,
	DefaultCostParameter,
	Empty,
	getPath,
	isCompositeGuard,
	LearningUnit,
	Skill,
	Unit,
	Variable
} from "@e-learning-by-sse/nm-skill-lib";
import {
	skills as SkillDb,
	unitsOfExample1A as UnitsDbA,
	unitsOfExample1B as UnitsDbB
} from "../../../../../data-access/database/src/lib/demo/skill-based-modelling";

describe("Skill-Lib", () => {
	// All skills of the platform, may be filtered if there is a good strategy
	let skills: Skill[];
	// All (relevant) nano modules and composites
	let nano_modules: LearningUnit[];

	beforeAll(async () => {
		skills = loadSkills();
		nano_modules = loadLearningUnits(skills);
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
		// Here: Treat each unit same -> Will optimize for the minimum number (not overall time)
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

			console.log(
				"Arbitrary Path:",

				path?.path
					.map(segment => segment.origin)
					.filter(unit => unit != null)
					.map(unit => unit.id)
			);

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

			console.log(
				"Path A:",
				path?.path
					.map(segment => segment.origin)
					.filter(unit => unit != null)
					.map(unit => unit.id)
			);

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

			console.log(
				"Path with background knowledge:",
				path?.path
					.map(segment => segment.origin)
					.filter(unit => unit != null)
					.map(unit => unit.id)
			);

			expect(path).not.toBeNull();
			// Example 1, Variation A has 26 NMs (2 Skills <-> NMs already known)
			// Example 1, Variation B has 10 NMs (should be excluded by selector)
			expect(path?.path.length).toBe(24);
		});
	});
});

/**
 * Loads mocked Skills of Demo Seed.
 * @returns Mocked Skills
 */
function loadSkills(): Skill[] {
	const nestedSkills = SkillDb.filter(skill => skill.parents !== undefined) as {
		id: string;
		parents: string[];
	}[];

	const skills = SkillDb.map(skill => ({
		id: skill.id,
		repositoryId: "A fictive repository",
		nestedSkills: nestedSkills
			.filter(child => child.parents.includes(skill.id))
			.map(child => child.id)
	}));
	return skills;
}

/**
 * Loads mocked LearningUnits of Demo Seed.
 * @returns Mocked LearningUnits
 */
function loadLearningUnits(allSkills: Skill[]): LearningUnit[] {
	const findSkill = (id: string) => allSkills.find(skill => skill.id === id);
	const convertToExpression = (skills?: string[]) =>
		skills && skills.length > 0
			? new And(
					skills
						.map(skill => findSkill(skill))
						.filter((s): s is Skill => s !== undefined)
						.map(skill => new Variable(skill))
				)
			: new Empty();

	// All (relevant) nano modules and composites
	return [...UnitsDbA, ...UnitsDbB].map(unit => ({
		id: unit.lessonId,
		title: unit.title,
		requiredSkills: convertToExpression(unit.requirements),
		teachingGoals: unit.teachingGoals
			.map(goal => findSkill(goal))
			.filter((s): s is Skill => s !== undefined),
		suggestedSkills: []
	}));
}
