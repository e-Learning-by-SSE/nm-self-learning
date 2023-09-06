import {
	LoadingBox,
	Table,
	TableDataColumn,
	TableHeaderColumn,
	showToast
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import React, { useState, useMemo, memo, useEffect, useContext } from "react";
import { FolderIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { PencilIcon, PuzzleIcon } from "@heroicons/react/outline";
import { trpc } from "@self-learning/api-client";
import { SkillRepository } from "@prisma/client";
import { SkillResolved } from "@self-learning/api";
import { SkillFormModel } from "@self-learning/types";
import { SkillQuickAddOption } from "./skill-taskbar";
import { FolderContext, SkillSelectHandler } from "./folder-editor";
import styles from "./folder-list-view.module.css";

export function toSkillFormModel(dbSkill: SkillResolved): SkillFormModel {
	return {
		id: dbSkill.id,
		name: dbSkill.name,
		description: dbSkill.description,
		repositoryId: dbSkill.repositoryId,
		children: dbSkill.children?.map(child => child.id),
		parents: dbSkill.parents?.map(parent => parent.id)
	};
}

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

	const createSkillAndSubmit = async () => {
		const newSkill = {
			name: "New Skill: " + Date.now(),
			description: "Desc here",
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

			handleSelection(toSkillFormModel(createdSkill));
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
	skill: SkillResolved;
	depth: number;
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
		<tr key={key} style={depthCssStyle} className="group cursor-pointer hover:bg-gray-100">
			<TableDataColumn className={`${styles["folder-line"]} text-sm font-medium`}>
				<div className="flex px-2">
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
							onClick={() => onEdit(toSkillFormModel(skill))}
						>
							<PencilIcon className="ml-1 h-5 text-lg" />
						</button>
						<SkillQuickAddOption selectedSkill={toSkillFormModel(skill)} />
					</div>
				</div>
			</TableDataColumn>
			<TableDataColumn>{skill.repository.name}</TableDataColumn>
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
	const { handleSelection } = useContext(FolderContext);
	const { data: skill, isLoading } = trpc.skill.getSkillById.useQuery({ skillId });
	const [open, setOpen] = useState(showChildren);

	return (
		// eslint-disable-next-line react/jsx-no-useless-fragment
		<>
			{isLoading || !skill ? (
				<LoadingBox />
			) : (
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
								skillId={element.id}
								showChildren={false}
								depth={depth + 1}
							/>
						))}
				</>
			)}
		</>
	);
}
const ListSkillEntryWithChildrenMemorized = memo(ListSkillEntryWithChildren);
