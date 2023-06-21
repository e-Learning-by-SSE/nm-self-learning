
import {
	LoadingBox,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { Fragment, useState, useMemo} from "react";
import Link  from "next/link";
import React from "react";
import { Skills, convertNestedSkillsToArray } from "@self-learning/types";
import { PlusIcon } from "@heroicons/react/solid";

export function AlternateSkillEditor({
    skilltree,
    onConfirm
} : {
    skilltree: Skills
    onConfirm: (skilltree: Skills) => void;
}) {


	const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
    const [displayName, setDisplayName] = useState("");

	const defaultTree: Skills = {
		id: "1",
		nestedSkills: [
			{
				id: "2",
				nestedSkills: [
					{
						id: "3",
						nestedSkills: [],
						name: "test3",
						level: 3,
						description: "test3",
					},
				],
				name: "test2",
				level: 1,
				description: "test2",
			},
		],
		name: "test",
		level: 0,
		description: "test",
		};

	const skillArray = convertNestedSkillsToArray(skilltree);


	const filteredSkillTrees = useMemo(() => {
		if (!skillArray) return [];
		if (!displayName || displayName.length === 0) return skillArray;

		const lowerCaseDisplayName = displayName.toLowerCase().trim();
		return skillArray.filter(skill =>
			skill.name.toLowerCase().includes(lowerCaseDisplayName)
		);
	}, [skillArray, displayName]);


	const toggleAccordion = (index: number) => {
		setActiveRowIndex(activeRowIndex === index ? null : index);
	};


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
						{filteredSkillTrees.map(({name}, index, value) => (
							<Fragment key={name}>
								{name && (
									<tr key={name}>
										<TableDataColumn>
											<div className="flex flex-wrap gap-4">
												<div className="text-sm font-medium hover:text-secondary" style={{cursor: "pointer"}} onClick={() => toggleAccordion(index)}>
													{name}
												</div>
											</div>
										</TableDataColumn>
										<TableDataColumn>
											<div className="flex flex-wrap justify-end gap-4">
												<button
													className="btn-stroked"
													onClick={() => {/* new function */}}
												>
													Editieren
												</button>
											</div>
										</TableDataColumn>
									</tr>
								)}
								{activeRowIndex === index && (
									<AccordionElement skillTreeItem={value[index]} 
										index={index}
										activeRowIndex={activeRowIndex}
									/>
								)}
							</Fragment>
						))}
					</Table>
				
			</CenteredSection>
        </div>
    );
}



export function AccordionElement({ skillTreeItem ,index , activeRowIndex }: { skillTreeItem: Skills, index: number, activeRowIndex: number }) {

	const [nestedSkills, setNestedSkills ] = useState<string[]>([""]);

	const newElement = (element: string) => {
		setNestedSkills([...nestedSkills, element]);
	}
	
	return(
		<tr className="border-b border-gray-300">
			<TableDataColumn>
				<button className="btn-primary" onClick={() => {newElement("neues")}}>
					<PlusIcon className="h-5 w-5" />
				</button>
			</TableDataColumn>
			<td colSpan={5} className="py-2 px-3">
				<div
					className={`px-6 pt-0 overflow-hidden transition-[max-height] duration-500 ease-in ${
					activeRowIndex === index ? 'max-h-36' : 'max-h-0'
					}`}>
					<div className="">
						<ul className="list-none overflow-auto border border-gray-300 rounded-md p-4 max-h-40 flex flex-wrap max-w-md">
							{nestedSkills && nestedSkills.length > 0 && nestedSkills.map((element, index) => (
								<li key={element} className="flex gap-4 py-2">
									<div className="text-sm font-medium">&nbsp;{element}
									{index !== nestedSkills.length - 1 && (",")}</div>
								</li>
							))}
						</ul>
					</div>
				</div>
			</td>
		</tr>
	);

}

  