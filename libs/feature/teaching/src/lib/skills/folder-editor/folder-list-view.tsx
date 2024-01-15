import {
	DialogHandler,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import React, { memo, useMemo, useState } from "react";
import {
	ChevronDownIcon,
	ChevronRightIcon,
	FolderIcon,
	PlusIcon,
	RefreshIcon,
	ShieldExclamationIcon
} from "@heroicons/react/solid";
import { PencilIcon, PuzzleIcon } from "@heroicons/react/outline";
import { SkillRepository } from "@prisma/client";
import { SkillFormModel } from "@self-learning/types";
import { SkillQuickAddOption } from "./skill-taskbar";
import { SkillSelectHandler } from "./folder-editor";
import styles from "./folder-list-view.module.css";
import { dispatchChange, useChangeDetection } from "./cycle-detection/detect-change-hook";
import { FolderItem } from "./cycle-detection/cycle-detection";
import { useSkillOperations } from "./skill-operations-hook";

export interface FolderProps {
	handleSelection: SkillSelectHandler;
	skillMap: Map<string, FolderItem>;
	setSkillMap: (skillMap: Map<string, FolderItem>) => void;
}

function FolderListView({
	repository,
	initialSkillMap,
	handleSelection
}: {
	repository: SkillRepository;
	initialSkillMap: Map<string, FolderItem>;
	handleSelection: SkillSelectHandler;
}) {
	const [displayName, setDisplayName] = useState("");
	const [skillMapState, setSkillMapState] = useState<Map<string, FolderItem>>(initialSkillMap);
	const [masterSelectToggle, setMasterSelectToggle] = useState<boolean>(false);

	const filteredSkillTrees = useMemo(() => {
		const skillArray = Array.from(skillMapState.values());
		if (!skillArray) return [];
		if (!displayName || displayName.length === 0) return skillArray;

		const lowerCaseDisplayName = displayName.toLowerCase().trim();
		return skillArray.filter(item =>
			item.skill.name.toLowerCase().includes(lowerCaseDisplayName)
		);
	}, [skillMapState, displayName]);

	const { addSkillWithoutParent } = useSkillOperations(skillMapState, handleSelection);

	const compareSkills = (a: FolderItem, b: FolderItem) => {
		if (a.skill.children.length > 0 && b.skill.children.length === 0) {
			return -1;
		}

		if (a.skill.children.length === 0 && b.skill.children.length > 0) {
			return 1;
		}
		return a.skill.name.localeCompare(b.skill.name);
	};

	const createSkillAndSubmit = async () => {
			await addSkillWithoutParent(repository.id, setSkillMapState);
	};

	const handleAllSelected = () => {
		const arrayOffFolderItems = Array.from(skillMapState.values());
		arrayOffFolderItems.forEach(item => {
			item.massSelected = !masterSelectToggle;
		});
		setMasterSelectToggle(!masterSelectToggle);
		dispatchChange(arrayOffFolderItems);
		handleSelection(
			arrayOffFolderItems.map(item => item.skill),
			skillMapState
		);
	};

	return (
		<div>
			<CenteredSection>
				<div className="mb-16 flex items-center justify-between gap-4">
					<h1 className="text-5xl">{repository.name}</h1>
					<button className="btn-primary" onClick={() => createSkillAndSubmit()}>
						<PlusIcon className="icon h-5" />
						<span>Skill hinzufügen</span>
					</button>
				</div>

				<SearchField
					placeholder="Suche nach Skill-Trees"
					onChange={e => {
						setDisplayName(e.target.value);
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
									onChange={() => handleAllSelected()}
									checked={masterSelectToggle}
								/>
							</th>
							<TableHeaderColumn>Bezeichnung</TableHeaderColumn>
							<TableHeaderColumn>Fremd-Skill</TableHeaderColumn>
						</>
					}
				>
					{filteredSkillTrees
						.sort(compareSkills)
						.map(
							element =>
								!(element.skill.parents.length > 0) && (
									<ListSkillEntryWithChildrenMemorized
										key={"baseDir child:" + element.skill.id}
										skillId={element.skill.id}
										depth={0}
										handleSelection={handleSelection}
										skillMap={skillMapState}
										showChildren={false}
									/>
								)
						)}
				</Table>
			</CenteredSection>
		</div>
	);
}

export default memo(FolderListView);

function SkillRow({
	skill,
	depth,
	displayInfo,
	childrenFoldedOut,
	onSelect,
	skillMap,
	handleSelection,
	onEdit,
	onMassSelect
}: {
	skill: SkillFormModel;
	depth: number;
	displayInfo: {
		isSelected: boolean;
		hasCycle: boolean;
		isParent: boolean;
		isMassSelected: boolean;
	};
	childrenFoldedOut: boolean;
	onSelect: () => void;
	skillMap: Map<string, FolderItem>;
	handleSelection: SkillSelectHandler;
	onEdit: SkillSelectHandler;
	onMassSelect: (skillID: string) => void;
}) {
	const key = skill.id + "_" + depth + "_" + Math.floor(Math.random() * 10000000001);
	const depthCssStyle = {
		"--depth": depth
	} as React.CSSProperties;
	const hasChildren = skill.children.length !== 0;

	return (
		<tr
			key={key}
			style={depthCssStyle}
			title={`${
				displayInfo.hasCycle && !displayInfo.isParent
					? "Dieser Skill ist Teil eines Zyklus."
					: !displayInfo.hasCycle && displayInfo.isParent
					? "Dieser Ordner enthält einen Zyklus, ist aber kein Teil davon."
					: ""
			}`}
			className={`group cursor-pointer hover:bg-gray-100 ${
				displayInfo.hasCycle && !displayInfo.isSelected ? "bg-red-100" : ""
			}
			${displayInfo.isParent && !displayInfo.hasCycle && !displayInfo.isSelected ? "bg-yellow-100" : ""}
			${displayInfo.isSelected ? "bg-gray-200" : ""} `}
		>
			<TableDataColumn className={"text-center align-middle"}>
				<input
					className="secondary form-checkbox rounded text-secondary focus:ring-secondary"
					type="checkbox"
					onChange={() => onMassSelect(skill.id)}
					checked={displayInfo.isMassSelected}
				/>
			</TableDataColumn>
			<TableDataColumn className={`${styles["folder-line"]} text-sm font-medium`}>
				<div className={`flex px-2`}>
					<div
						className={`flex ${hasChildren && "hover:text-secondary"}`}
						onClick={onSelect}
					>
						<div className="flex px-3">
							{hasChildren ? (
								<>
									<div className="mr-1">
										{childrenFoldedOut ? (
											<ChevronDownIcon className=" icon h-5 text-lg" />
										) : (
											<ChevronRightIcon className="icon h-5 text-lg" />
										)}{" "}
									</div>
									<FolderIcon className="icon h-5 text-lg" />{" "}
								</>
							) : (
								<div className="ml-6">
									<PuzzleIcon className="icon h-5 text-lg" />
								</div>
							)}
						</div>

						{displayInfo.hasCycle && (
							<RefreshIcon className="icon h-5 text-lg text-red-500" />
						)}
						{displayInfo.isParent && !displayInfo.hasCycle && (
							<ShieldExclamationIcon className="icon h-5 text-lg text-yellow-500" />
						)}

						<span className={`${displayInfo.isSelected ? "text-secondary" : ""}`}>
							{skill.name}
							{hasChildren && " (" + skill.children.length + ")"}
						</span>
					</div>
					<div className="invisible  group-hover:visible">
						<button
							title="Bearbeiten"
							className="mr-3 px-2 hover:text-secondary"
							onClick={() => onEdit([skill], skillMap)}
							disabled={displayInfo.isSelected}
						>
							<PencilIcon className="ml-1 h-5 text-lg" />
						</button>
						<SkillQuickAddOption
							selectedSkill={skill}
							skillMap={skillMap}
							handleSelection={handleSelection}
						/>
					</div>
				</div>
			</TableDataColumn>
			<TableDataColumn>{"nicht vorhanden"}</TableDataColumn>
		</tr>
	);
}

function ListSkillEntryWithChildren({
	skillId,
	depth,
	skillMap,
	handleSelection,
	showChildren
}: {
	skillId: string;
	depth: number;
	skillMap: Map<string, FolderItem>;
	handleSelection: SkillSelectHandler;
	showChildren: boolean;
}) {
	const folderItemFromDetection = useChangeDetection(skillId);
	const folderItem = skillMap.get(skillId);
	const [open, setOpen] = useState(showChildren);

	if (!folderItem) return <div>503</div>;

	// Set ups the callable value hooks;
	const isSelected =
		folderItemFromDetection.item !== null && folderItemFromDetection.item.selectedSkill;

	const isMassSelected = folderItem.massSelected ?? false;

	const hasCycle = folderItem.cycle ? true : false;
	const isParent = folderItem.parent ? true : false;
	const skill = folderItem.skill ?? null;

	const handleMassSelectionChange = (skillID: string) => {
		const item = skillMap.get(skillID);
		if (!item) return;
		item.massSelected = !item.massSelected;

		const folderItem: FolderItem = {
			...item,
			massSelected: true
		};
		dispatchChange([folderItem]);
		//TODO: Get the array from another source

		handleSelection(
			Array.from(skillMap.values())
				.filter(item => item.massSelected)
				.map(item => item.skill),
			skillMap
		);
	};

	return (
		// eslint-disable-next-line react/jsx-no-useless-fragment
		<>
			<>
				<SkillRow
					skill={folderItem.skill}
					depth={depth}
					displayInfo={{ isSelected, hasCycle, isParent, isMassSelected }}
					onSelect={() => setOpen(!open)}
					skillMap={skillMap}
					handleSelection={handleSelection}
					onEdit={handleSelection}
					childrenFoldedOut={open}
					onMassSelect={handleMassSelectionChange}
				/>
				{open &&
					skill.children.map(element => (
						<ListSkillEntryWithChildrenMemorized // recursive structure to add <SkillRow /> for each child
							key={"baseDir child:" + element}
							skillId={element}
							handleSelection={handleSelection}
							skillMap={skillMap}
							showChildren={false}
							depth={depth + 1}
						/>
					))}
			</>
		</>
	);
}

const ListSkillEntryWithChildrenMemorized = memo(ListSkillEntryWithChildren);
