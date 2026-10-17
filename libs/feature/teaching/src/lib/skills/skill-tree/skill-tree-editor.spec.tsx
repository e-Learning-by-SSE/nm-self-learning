import type { ComponentProps, PropsWithChildren } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import type { SkillFolderVisualization } from "../folder-editor/skill-display";
import { SkillTreeRows } from "../skill-tree-rows";
import { SkillTreeEditor } from "./skill-tree-editor";
import { SkillFolderTable } from "../folder-editor/folder-table";
import { filterSkillTree } from "../filter-skill-tree";

jest.mock("next-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key })
}));

jest.mock("@self-learning/ui/layouts", () => ({
	CenteredSection: ({ children }: PropsWithChildren) => <div>{children}</div>,
	useMySkillPermissions: (enabled: boolean) =>
		enabled ? new Set(["core", "fundamentals", "basics"]) : undefined
}));

jest.mock("@self-learning/ui/forms", () =>
	jest.requireActual("../../../../../../ui/forms/src/lib/searchfield")
);

jest.mock("@self-learning/api-client", () => ({
	trpc: {
		skill: {
			createSkill: { useMutation: () => ({ mutateAsync: jest.fn() }) },
			updateSkill: { useMutation: () => ({ mutateAsync: jest.fn() }) }
		}
	}
}));

jest.mock("@hello-pangea/dnd", () => ({
	DragDropContext: ({ children }: PropsWithChildren) => <div>{children}</div>
}));

jest.mock("../skill-dialog/add-skill-dialog", () => ({ AddSkillDialog: () => null }));

jest.mock("../folder-editor/skilltree/skill-row-entry", () =>
	jest.requireMock("./skill-row-editor")
);

jest.mock("@self-learning/ui/common", () => ({
	DialogHandler: () => null,
	IconTextButton: ({ text, onClick }: { text: string; onClick: () => void }) => (
		<button onClick={onClick}>{text}</button>
	),
	TableHeaderColumn: () => null,
	Table: ({ children }: PropsWithChildren) => (
		<table>
			<tbody>{children}</tbody>
		</table>
	)
}));

// Keep the real tree traversal; replace row actions that require DnD and API providers.
jest.mock("./skill-row-editor", () => ({
	ListSkillEntryWithChildren: (
		props: Omit<ComponentProps<typeof SkillTreeRows>, "renderRow">
	) => (
		<SkillTreeRows
			{...props}
			renderRow={({ skill }) => (
				<tr>
					<td>
						<button aria-expanded={skill.isExpanded}>{skill.skill.name}</button>
					</td>
				</tr>
			)}
		/>
	)
}));

function createSkills() {
	const skills: SkillFolderVisualization[] = [
		{
			id: "core",
			skill: {
				id: "core",
				name: "React Core Concepts",
				parents: [],
				children: ["fundamentals", "unrelated"],
				authorId: 1,
				description: null
			},
			children: ["fundamentals", "unrelated"],
			isFolder: true,
			numberChildren: 2,
			isExpanded: false,
			isSelected: false,
			isCycleMember: false,
			hasNestedCycleMembers: false,
			shortHighlight: false
		}
	];
	for (const [id, name, parents, children] of [
		["fundamentals", "Component Fundamentals", ["core"], ["basics"]],
		["basics", "Component Basics", ["fundamentals"], []],
		["unrelated", "Unrelated cycle", ["core", "unrelated"], ["unrelated"]]
	] as const) {
		skills.push({
			...skills[0],
			id,
			skill: { ...skills[0].skill, id, name, parents: [...parents], children: [...children] },
			children: [...children],
			isFolder: children.length > 0,
			numberChildren: children.length
		});
	}
	return new Map(skills.map(skill => [skill.id, skill]));
}

describe.each(["SkillTreeEditor", "SkillFolderTable"])("%s search", view => {
	// First parameter (searchTerm) is the text to enter into the search field.
	// Second parameter (rootExpanded) indicates whether the root skill is initially expanded.
	// Tests that parents of matching skills are automatically expanded during search, independently of previous state
	it.each<[string, boolean]>([
		["Com", false],
		["Com", true],
		["Comp", false],
		["Comp", true],
		["  cOmP  ", false],
		["Component Basics", false],
		["Component Basics", true]
	])(
		"immediately reveals %s with stored root expansion %s and restores the previous state",
		(searchTerm, rootExpanded) => {
			// Setup
			const skills = createSkills();
			skills.get("core")!.isExpanded = rootExpanded;
			for (const skill of skills.values()) Object.freeze(skill);
			render(
				view === "SkillTreeEditor" ? (
					<SkillTreeEditor
						skillDisplayData={skills}
						updateSkillDisplay={jest.fn()}
						onSkillSelect={jest.fn()}
						onSkillCreate={jest.fn()}
					/>
				) : (
					<SkillFolderTable
						skillDisplayData={skills}
						updateSkillDisplay={jest.fn()}
						onSkillSelect={jest.fn()}
						authorId={1}
					/>
				)
			);
			fireEvent.click(screen.getByRole("checkbox", { name: "Show_Only_My_Skills" }));
			expect(screen.queryByRole("button", { name: "Component Basics" })).toBeNull();

			// Exercise
			fireEvent.change(screen.getByPlaceholderText("Skills_Search"), {
				target: { value: searchTerm }
			});

			// Verify
			expect(screen.getByRole("button", { name: "Component Basics" })).toBeDefined();
			expect(screen.queryByRole("button", { name: "Unrelated cycle" })).toBeNull();
			for (const name of ["React Core Concepts", "Component Fundamentals"]) {
				expect(screen.getByRole("button", { name }).getAttribute("aria-expanded")).toBe(
					"true"
				);
			}
			for (const skill of skills.values()) {
				expect(skill.isExpanded).toBe(skill.id === "core" ? rootExpanded : false);
			}

			// Exercise
			fireEvent.change(screen.getByPlaceholderText("Skills_Search"), {
				target: { value: "" }
			});

			// Verify
			expect(screen.queryByRole("button", { name: "Component Basics" })).toBeNull();
			expect(
				screen
					.getByRole("button", { name: "React Core Concepts" })
					.getAttribute("aria-expanded")
			).toBe(String(rootExpanded));
		}
	);
});

describe("filterSkillTree permissions", () => {
	it("keeps inaccessible ancestors to reveal an accessible matching child", () => {
		// Setup
		const skills = createSkills();

		// Exercise
		const { skillsToDisplay, matchingSkillIds, autoExpandIds } = filterSkillTree(
			skills,
			"Comp",
			new Set(["basics"])
		);

		// Verify
		expect(skillsToDisplay.map(skill => skill.id)).toEqual(["core"]);
		expect(matchingSkillIds).toEqual(new Set(["basics"]));
		expect(autoExpandIds).toEqual(new Set(["core", "fundamentals"]));
	});

	it("does not include an inaccessible child among the search matches", () => {
		// Setup
		const skills = createSkills();

		// Exercise
		const { matchingSkillIds } = filterSkillTree(
			skills,
			"Comp",
			new Set(["core", "fundamentals"])
		);

		// Verify
		expect(matchingSkillIds).toEqual(new Set(["fundamentals"]));
	});
});
