import { trpc } from "@self-learning/api-client";
import { DialogHandler, IconTextButton, Table, TableHeaderColumn } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import React, { useMemo, useState } from "react";
import {
	SkillCreateHandler,
	SkillFolderVisualization,
	SkillSelectHandler,
	UpdateVisuals
} from "../folder-editor/skill-display";
import { OnlyOwnSkillsCheckbox } from "../only-own-skills-checkbox";
import { ListSkillEntryWithChildren } from "./skill-row-editor";
import { PlusIcon } from "@heroicons/react/24/solid";

export function SkillTreeEditor({
	skillDisplayData,
	updateSkillDisplay,
	onSkillSelect,
	onSkillCreate
}: {
	skillDisplayData: Map<string, SkillFolderVisualization>;
	updateSkillDisplay: UpdateVisuals;
	onSkillSelect: SkillSelectHandler;
	onSkillCreate: SkillCreateHandler;
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const [onlyOwnSkills, setOnlyOwnSkills] = useState(false);
	const session = useRequiredSession();
	const username = session.data?.user.name;
	const { data: author } = trpc.author.getByUsername.useQuery(
		{ username: username ?? "" },
		{ enabled: !!username }
	);
	const authorId = author?.id;
	const normalized = searchTerm.toLowerCase().trim();
	const allSkills = Array.from(skillDisplayData.values());
	const matchingSkillIds: Set<string> = new Set(
		allSkills
			.filter(skill => {
				const nameMatches =
					skill.skill.name.toLowerCase().includes(normalized) ||
					skill.displayName?.toLowerCase().includes(normalized);
				// Until the author id is known, do not hide the whole tree.
				const ownMatches =
					!onlyOwnSkills || authorId === undefined || skill.skill.authorId === authorId;
				return nameMatches && ownMatches;
			})
			.map(skill => skill.id)
	);
	const skillIdsToAutoExpand: Set<string> = new Set();
	const skillsToDisplay = useMemo(() => {
		const skillIdsToRender: Set<string> = new Set(matchingSkillIds);
		matchingSkillIds.forEach(skillId => {
			collectAncestors(skillId, skillDisplayData, skillIdsToRender, skillIdsToAutoExpand);
		});
		if (!searchTerm?.trim() && !onlyOwnSkills) {
			return allSkills.filter(IsTopLevelSkill).sort(byChildrenLength);
		}
		return allSkills
			.filter(skill => IsTopLevelSkill(skill) && skillIdsToRender.has(skill.id))
			.sort(byChildrenLength);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		skillDisplayData,
		searchTerm,
		onlyOwnSkills,
		matchingSkillIds,
		skillIdsToAutoExpand,
		allSkills
	]);

	function collectAncestors(
		skillId: string,
		map: Map<string, SkillFolderVisualization>,
		result: Set<string>,
		autoExpand: Set<string>
	) {
		const skill = map.get(skillId);
		if (!skill) return;
		for (const parentId of skill.skill.parents) {
			if (!result.has(parentId)) {
				result.add(parentId);
				autoExpand.add(parentId);
				collectAncestors(parentId, map, result, autoExpand);
			}
		}
	}

	return (
		<div>
			<CenteredSection className="!py-0">
				<SearchField
					placeholder="Suche nach Skill"
					onChange={e => {
						setSearchTerm(e.target.value);
					}}
				/>
				<OnlyOwnSkillsCheckbox checked={onlyOwnSkills} onChange={setOnlyOwnSkills} />
				<IconTextButton
					text={"Neu Skill Hinzufügen"}
					className="btn-secondary"
					onClick={() => onSkillCreate({ name: searchTerm })}
					icon={<PlusIcon className="icon h-5" />}
				/>
				<DialogHandler id={"alert"} />
				<div className="pt-4" />
				<Table head={<TableHeaderColumn>Skills</TableHeaderColumn>}>
					{skillsToDisplay.sort(byChildrenLength).map(element => (
						<ListSkillEntryWithChildren
							key={element.id}
							skillDisplayData={element}
							updateSkillDisplay={updateSkillDisplay}
							skillResolver={skillId => skillDisplayData.get(skillId)}
							parentNodeId={""}
							matchingSkillIds={matchingSkillIds}
							autoExpandIds={skillIdsToAutoExpand}
							handleSelection={onSkillSelect}
							handleCreation={onSkillCreate}
							textClassName="hover:text-emerald-500"
						/>
					))}
				</Table>
				<DialogHandler id={"copyMoveDialog"} />
			</CenteredSection>
		</div>
	);
}

const byChildrenLength = (a: SkillFolderVisualization, b: SkillFolderVisualization) => {
	return b.numberChildren - a.numberChildren || a.skill.name.localeCompare(b.skill.name);
};

const IsTopLevelSkill = (skill: SkillFolderVisualization) => {
	return skill.skill.parents.length === 0 || skill.isCycleMember;
};
