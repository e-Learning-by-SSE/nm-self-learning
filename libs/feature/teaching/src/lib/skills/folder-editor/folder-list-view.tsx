import { Table, TableDataColumn, TableHeaderColumn, showToast } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import React, { useState, useMemo, memo, useEffect, useContext } from "react";
import {
	LightningBoltIcon,
	FolderIcon,
	PlusIcon,
	ChevronDownIcon,
	ChevronRightIcon
} from "@heroicons/react/solid";
import { ArrowCircleLeftIcon, PencilIcon, PuzzleIcon } from "@heroicons/react/outline";
import { trpc } from "@self-learning/api-client";
import { SkillRepository } from "@prisma/client";
import { SkillFormModel } from "@self-learning/types";
import { SkillQuickAddOption } from "./skill-taskbar";
import { FolderContext, SkillSelectHandler } from "./folder-editor";
import styles from "./folder-list-view.module.css";
import { mockProviders } from "next-auth/client/__tests__/helpers/mocks";
import { Alert } from "../../../../../../ui/common/src/lib/alert/alert";
import { useDetection } from "./cycle-detection/detection-hook";
import type = mockProviders.github.type;

function FolderListView({ repository }: { repository: SkillRepository }) {
	const [displayName, setDisplayName] = useState("");
	const [skillArray, setSkillArray] = useState<string[]>();
	const { data: skills } = trpc.skill.getSkillsWithoutParentFromRepo.useQuery({
		repoId: repository.id
	});

	useEffect(() => {
		if (skills) {
			setSkillArray(skills.map(skill => skill.id));
		}
	}, [skills]);

	const filteredSkillTrees = useMemo(() => {
		if (!skillArray) return [];
		if (!displayName || displayName.length === 0) return skillArray;

		const lowerCaseDisplayName = displayName.toLowerCase().trim();
		return skillArray.filter(skill => skill.toLowerCase().includes(lowerCaseDisplayName));
	}, [skillArray, displayName]);

	const { mutateAsync: createSkill } = trpc.skill.createSkill.useMutation();
	const { handleSelection } = useContext(FolderContext);
	//TODO: fix this
	const createSkillAndSubmit = async () => {
		const newSkill = {
			name: "New Skill: " + Date.now(),
			description: "Add here",
			children: []
		};

		try {
			const createdSkill = await createSkill({
				repId: repository.id,
				skill: { ...newSkill, children: [] } // add empty children array
			});
			showToast({
				type: "success",
				title: "Skill gespeichert!",
				subtitle: ""
			});
			console.log("New skill created", createdSkill);

			handleSelection(createdSkill);
			setSkillArray([...(skillArray ?? []), createdSkill.id]);
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

				<Alert type={{ severity: "ERROR", message: "MESSAGE" }} />
				<Table
					head={
						<>
							<TableHeaderColumn>Bezeichnung</TableHeaderColumn>
							<TableHeaderColumn>Fremd-Skill</TableHeaderColumn>
						</>
					}
				>
					{filteredSkillTrees.map(element => (
						<ListSkillEntryWithChildrenMemorized
							key={"baseDir child:" + element}
							skillId={element}
							depth={0}
							showChildren={false}
						/>
					))}
				</Table>
			</CenteredSection>
		</div>
	);
}

export default memo(FolderListView);

function SkillRow({
	skill,
	depth,
	childrenFoldedOut,
	onSelect,
	onEdit
}: {
	skill: SkillFormModel;
	depth: number;
	childrenFoldedOut: boolean;
	onSelect: () => void;
	onEdit: SkillSelectHandler;
}) {
	const folderItem = useDetection(skill.id);
	const key = skill.id + "_" + depth + "_" + Math.floor(Math.random() * 10000000001);
	const depthCssStyle = {
		"--depth": depth
	} as React.CSSProperties;

	const hasChildren = skill.children.length !== 0;
	return (
		<tr key={key} style={depthCssStyle} className="group cursor-pointer hover:bg-gray-100">
			<TableDataColumn className={`${styles["folder-line"]} text-sm font-medium`}>
				<div className="flex px-2">
					{folderItem.item !== null && folderItem.item.cycle && (
						<LightningBoltIcon className="icon h-5 text-lg text-red-500" />
					)}
					{folderItem.item !== null && folderItem.item.selectedSkill && (
						<ArrowCircleLeftIcon className="icon h-5 text-lg text-secondary" />
					)}
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
						<span>
							{skill.name}
							{hasChildren && " (" + skill.children.length + ")"}
						</span>
					</div>
					<div className="invisible  group-hover:visible">
						<button
							title="Bearbeiten"
							className="mr-3 px-2 hover:text-secondary"
							onClick={() => onEdit(skill)}
						>
							<PencilIcon className="ml-1 h-5 text-lg" />
						</button>
						<SkillQuickAddOption selectedSkill={skill} />
					</div>
				</div>
			</TableDataColumn>
			<TableDataColumn>{"name später"}</TableDataColumn>
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
	const skill = skillMap.get(skillId)?.skill;
	const [open, setOpen] = useState(showChildren);

	if (!skill) return <div>503</div>;

	return (
		// eslint-disable-next-line react/jsx-no-useless-fragment
		<>
			<>
				<SkillRow
					skill={skill}
					depth={depth}
					onSelect={() => setOpen(!open)}
					onEdit={handleSelection}
					childrenFoldedOut={open}
				/>
				{open &&
					skill.children.map(element => (
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
