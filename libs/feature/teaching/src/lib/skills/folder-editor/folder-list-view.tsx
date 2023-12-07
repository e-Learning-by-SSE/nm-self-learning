import {
	DialogHandler,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import React, { memo, useContext, useMemo, useState } from "react";
import {
	ChevronDownIcon,
	ChevronRightIcon,
	FolderIcon,
	PlusIcon,
	RefreshIcon,
	ShieldExclamationIcon
} from "@heroicons/react/solid";
import { PencilIcon, PuzzleIcon } from "@heroicons/react/outline";
import { trpc } from "@self-learning/api-client";
import { SkillRepository } from "@prisma/client";
import { SkillFormModel } from "@self-learning/types";
import { SkillQuickAddOption } from "./skill-taskbar";
import { FolderContext, SkillSelectHandler } from "./folder-editor";
import styles from "./folder-list-view.module.css";
import { useDetection } from "./cycle-detection/detection-hook";
import { checkForCycles, FolderItem } from "./cycle-detection/cycle-detection";

function FolderListView({
	repository,
	skillMap
}: {
	repository: SkillRepository;
	skillMap: Map<string, FolderItem>;
}) {
	const [displayName, setDisplayName] = useState("");
	const [skillArray, setSkillArray] = useState<FolderItem[]>(Array.from(skillMap.values()));

	const filteredSkillTrees = useMemo(() => {
		if (!skillArray) return [];
		if (!displayName || displayName.length === 0) return skillArray;

		const lowerCaseDisplayName = displayName.toLowerCase().trim();
		return skillArray.filter(item =>
			item.skill.name.toLowerCase().includes(lowerCaseDisplayName)
		);
	}, [skillArray, displayName]);

	const { mutateAsync: createSkill } = trpc.skill.createSkill.useMutation();
	const { handleSelection } = useContext(FolderContext);

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
		const newSkill = {
			name: "New Skill: " + Date.now(),
			description: "Add here",
			children: []
		};
		try {
			const createdSkill = await createSkill({
				repId: repository.id,
				skill: newSkill
			});
			const createSkillFormModel = {
				name: createdSkill.name,
				description: createdSkill.description,
				children: createdSkill.children.map(skill => skill.id),
				id: createdSkill.id,
				repositoryId: createdSkill.repository.id,
				parents: createdSkill.parents.map(skill => skill.id)
			};

			skillMap.set(createdSkill.id, { skill: createSkillFormModel, selectedSkill: false });
			handleSelection(createSkillFormModel);
			setSkillArray(skillArray.concat({ skill: createSkillFormModel, selectedSkill: false }));
			checkForCycles(skillMap);
		} catch (error) {
			if (error instanceof Error) {
				showToast({
					type: "error",
					title: "Skill konnte nicht gespeichert werden!",
					subtitle: error.message ?? ""
				});
			}
		}
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
	addChildren,
	displayInfo,
	childrenFoldedOut,
	onSelect,
	onEdit
}: {
	skill: SkillFormModel;
	depth: number;
	addChildren: (formModel: SkillFormModel) => void;
	displayInfo: { isSelected: boolean; hasCycle: boolean; isParent: boolean };
	childrenFoldedOut: boolean;
	onSelect: () => void;
	onEdit: SkillSelectHandler;
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
							onClick={() => onEdit(skill)}
							disabled={displayInfo.isSelected}
						>
							<PencilIcon className="ml-1 h-5 text-lg" />
						</button>
						<SkillQuickAddOption selectedSkill={skill} addChildren={addChildren} />
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
	showChildren
}: {
	skillId: string;
	depth: number;
	showChildren: boolean;
}) {
	const { handleSelection, skillMap } = useContext(FolderContext);
	const folderItemFromDetection = useDetection(skillId);
	const folderItem = skillMap.get(skillId);
	const [open, setOpen] = useState(showChildren);
	const [, setAddChildren] = useState<SkillFormModel | null>(null);

	const addChildrenFunction = (formModel: SkillFormModel) => {
		setAddChildren(formModel);
	};

	if (!folderItem) return <div>503</div>;

	// Set ups the callable value hooks;
	const isSelected =
		folderItemFromDetection.item !== null && folderItemFromDetection.item.selectedSkill;
	let hasCycle = false;
	let isParent = false;
	if (folderItemFromDetection.initial) {
		isParent = !!folderItem.parent;
		hasCycle = !!folderItem.cycle;
	} else {
		isParent =
			folderItemFromDetection.item && folderItemFromDetection.item.parent ? true : false;
		hasCycle =
			folderItemFromDetection.item && folderItemFromDetection.item.cycle ? true : false;
	}

	let skill = folderItem.skill;
	if (!folderItemFromDetection.initial) {
		skill = folderItemFromDetection.item?.skill ?? folderItem.skill;
		console.log("skill: ", folderItemFromDetection.item?.skill);
	}

	return (
		// eslint-disable-next-line react/jsx-no-useless-fragment
		<>
			<>
				<SkillRow
					skill={skill}
					depth={depth}
					addChildren={addChildrenFunction}
					displayInfo={{ isSelected, hasCycle, isParent }}
					onSelect={() => setOpen(!open)}
					onEdit={handleSelection}
					childrenFoldedOut={open}
				/>
				{open &&
					folderItem.skill.children.map(element => (
						<ListSkillEntryWithChildrenMemorized // recursive structure to add <SkillRow /> for each child
							key={"baseDir child:" + element}
							skillId={element}
							showChildren={false}
							depth={depth + 1}
						/>
					))}
			</>
		</>
	);
}

const ListSkillEntryWithChildrenMemorized = memo(ListSkillEntryWithChildren);
