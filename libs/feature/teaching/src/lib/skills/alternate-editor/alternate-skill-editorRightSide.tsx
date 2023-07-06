
import {
	LoadingBox,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { Fragment, useState, useMemo, useId, memo, useEffect} from "react";
import Link  from "next/link";
import React from "react";
import { Skills, convertNestedSkillsToArray } from "@self-learning/types";
import { FolderIcon, FolderRemoveIcon, PlusIcon } from "@heroicons/react/solid";
import { fil } from "date-fns/locale";

export default memo(AlternateSkillEditorRightSide);

function AlternateSkillEditorRightSide({
    skilltree,
	changeSelectedItem,
    onConfirm
} : {
    skilltree: Skills,
	changeSelectedItem: (skilltree: Skills) => void;
    onConfirm: (skilltree: Skills) => void;
}) {


	const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
    const [displayName, setDisplayName] = useState("");

	const skillArray = convertNestedSkillsToArray(skilltree);


	const filteredSkillTrees = useMemo(() => {
		if (!skillArray) return [];
		if (!displayName || displayName.length === 0) return skillArray;

		const lowerCaseDisplayName = displayName.toLowerCase().trim();
		return skillArray.filter(skill =>
			skill.name.toLowerCase().includes(lowerCaseDisplayName)
		);
	}, [skillArray, displayName]);




    return (
        <div>
            <CenteredSection>
				<div className="mb-16 flex items-center justify-between gap-4">
					<h1 className="text-5xl">SkillTrees</h1>
				</div>

				<SearchField
					placeholder="Suche nach Skill-Trees"
					onChange={e => {setDisplayName(e.target.value); setActiveRowIndex(null)}}
				/>

					<Table
						head={
							<>
								<TableHeaderColumn>Name</TableHeaderColumn>
								<TableHeaderColumn></TableHeaderColumn>
							</>
						}
					>
							<ListElement skill={skilltree} 
								color={0 * 100} 
								changeSelectedItem={changeSelectedItem} />
						
					</Table>
				
			</CenteredSection>
        </div>
    );
}



export function ListElement({
	skill,
	changeSelectedItem,
	color
} : {
	skill: Skills,
	changeSelectedItem: (skilltree: Skills) => void,
	color: number
}) {

	const [open, setOpen] = useState<boolean>(false);
	const [skillState, setSkillState] = useState<Skills>(skill);

	const addSkill = (name : string) => {
		const newSkill = {
			id: Math.random().toString(36).substring(7),
			name: name,
			description:"test",
			level: skillState.level + 1,
			nestedSkills: []
		}
		const newSkillState = {
			...skillState,
			nestedSkills: [...skillState.nestedSkills, newSkill], 
		  };
		setSkillState(newSkillState);
	}

	return (
		<Fragment key={skillState.id + skillState.level}>
			<tr key={skillState.id + skillState.level} className={`bg-gray-${color}`}>
				<TableDataColumn>
				<div className="flex items-center gap-4">
            		{skillState.nestedSkills.length > 0 ?
					<FolderIcon className="icon h-5 text-lg hover:text-secondary" /> :
					<FolderRemoveIcon className="icon h-5 text-lg hover:text-secondary" />}
						<div className="text-sm font-medium hover:text-secondary" style={{cursor: "pointer"}} 
						onClick={() => {setOpen(!open); changeSelectedItem(skillState)}} >
							{skillState.level + 1 }. {skillState.name}
						</div>
					</div>
				</TableDataColumn>
			<TableDataColumn>
				<div className="flex flex-wrap justify-end gap-4">
					<PlusIcon className="icon h-5 text-lg hover:text-secondary" 
					style={{cursor: "pointer"}}
					onClick={() => {addSkill(Date.now().toString())}}/>
				</div>
			</TableDataColumn>
			</tr>
			{open && skillState.nestedSkills.length > 0 && (
				skillState.nestedSkills.map((element) =>
				<ListElement skill={element} 
					changeSelectedItem={changeSelectedItem}
					color={element.level * 100} 
					/>
				)
			)}
		</Fragment>
	);
}

  



  