import { useTranslation } from "next-i18next";
import { DialogHandler, IconTextButton, Table, TableHeaderColumn } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection, useMySkillPermissions } from "@self-learning/ui/layouts";
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
import { filterSkillTree } from "../filter-skill-tree";

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
	const { t } = useTranslation(["feature-teaching", "common"]);
	const [searchTerm, setSearchTerm] = useState("");
	const [onlyOwnSkills, setOnlyOwnSkills] = useState(true);
	// Undefined while loading, so the tree is not hidden before membership ids arrive.
	const skillPermissions = useMySkillPermissions(onlyOwnSkills);
	const { skillsToDisplay, matchingSkillIds, autoExpandIds } = useMemo(
		() =>
			filterSkillTree(
				skillDisplayData,
				searchTerm,
				onlyOwnSkills ? skillPermissions : undefined
			),
		[skillDisplayData, searchTerm, onlyOwnSkills, skillPermissions]
	);

	return (
		<div>
			<CenteredSection className="!py-0">
				<SearchField
					placeholder={t("Skills_Search")}
					onChange={e => {
						setSearchTerm(e.target.value);
					}}
				/>
				<OnlyOwnSkillsCheckbox checked={onlyOwnSkills} onChange={setOnlyOwnSkills} />
				<IconTextButton
					text={t("Skills_Add")}
					className="btn-secondary"
					onClick={() => onSkillCreate({ name: searchTerm })}
					icon={<PlusIcon className="icon h-5" />}
				/>
				<DialogHandler id={"alert"} />
				<div className="pt-4" />
				<Table head={<TableHeaderColumn>{t("Skills_Title")}</TableHeaderColumn>}>
					{skillsToDisplay.map(element => (
						<ListSkillEntryWithChildren
							key={element.id}
							skillDisplayData={element}
							updateSkillDisplay={updateSkillDisplay}
							skillResolver={skillId => skillDisplayData.get(skillId)}
							parentNodeId={""}
							matchingSkillIds={matchingSkillIds}
							autoExpandIds={autoExpandIds}
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
