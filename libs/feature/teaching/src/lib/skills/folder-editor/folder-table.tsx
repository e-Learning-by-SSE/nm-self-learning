import { DialogHandler, Table, TableHeaderColumn } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import React, { useMemo, useState } from "react";
import { SkillRepository } from "@prisma/client";
import { ListSkillEntryWithChildren } from "./skill-row-entry";
import { NewSkillButton } from "./skill-taskbar";
import { SkillFolderVisualization, SkillSelectHandler, UpdateVisuals } from "./skill-display";
import { Skill } from "@prisma/client";

const compareSkills = (a: SkillFolderVisualization, b: SkillFolderVisualization) => {
	return (
		b.skill.children.length - a.skill.children.length ||
		a.skill.name.localeCompare(b.skill.name)
	);
};

export function SkillFolderTable({
	repository,
	skillDisplayData,
	onSkillSelect: handleSelection,
	updateSkillDisplay
}: {
	repository: SkillRepository;
	skillDisplayData: Map<string, SkillFolderVisualization>;
	onSkillSelect: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
}) {
	const [searchTerm, setSearchTerm] = useState("");

	const skillsToDisplay = useMemo(() => {
		const skills = Array.from(skillDisplayData.values());

		if (!searchTerm?.trim()) return skills;

		const normalizedSearchTerm = searchTerm.toLowerCase().trim();
		return skills.filter(
			skill =>
				skill.skill.name.toLowerCase().includes(normalizedSearchTerm) ||
				skill.displayName?.toLowerCase().includes(normalizedSearchTerm)
		);
	}, [skillDisplayData, searchTerm]);

	const setShortHighlight = (skill: Skill) =>
		updateSkillDisplay([{ id: skill.id, shortHighlight: true }]);

	return (
		<div>
			<CenteredSection>
				<div className="mb-16 flex items-center justify-between gap-4">
					<h1 className="text-5xl">{repository.name}</h1>
					<NewSkillButton repoId={repository.id} onSuccess={setShortHighlight} />
				</div>

				<SearchField
					placeholder="Suche nach Skill-Trees"
					onChange={e => {
						setSearchTerm(e.target.value);
					}}
				/>

				<DialogHandler id={"alert"} />
				<div className="pt-4" />
				<Table
					head={
						<>
							<th
								className={
									"font-semi-bold border-y border-light-border py-4 text-center text-sm"
								}
							>
								<input
									className="secondary form-checkbox rounded text-secondary focus:ring-secondary"
									type="checkbox"
									onChange={() => {}}
									checked={false}
								/>
							</th>
							<TableHeaderColumn>Bezeichnung</TableHeaderColumn>
							<TableHeaderColumn>Fremd-Skill</TableHeaderColumn>
						</>
					}
				>
					{skillsToDisplay
						.sort(compareSkills)
						.map(
							element =>
								!(element.skill.parents.length > 0) && (
									<ListSkillEntryWithChildren
										key={`${element.id}-0`}
										skillDisplayData={element}
										depth={0}
										updateSkillDisplay={updateSkillDisplay}
										handleSelection={handleSelection}
										skillResolver={skillId => skillDisplayData.get(skillId)}
									/>
								)
						)}
				</Table>
			</CenteredSection>
		</div>
	);
}
