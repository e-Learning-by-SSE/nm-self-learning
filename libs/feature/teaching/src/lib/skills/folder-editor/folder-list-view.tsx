import {
	LoadingBox,
	Table,
	TableDataColumn,
	TableHeaderColumn,
	showToast
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import { useState, useMemo, memo, useEffect, useContext } from "react";
import { FolderIcon, PlusIcon, FolderDownloadIcon } from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import { SkillRepository } from "@prisma/client";
import { SkillResolved } from "@self-learning/api";
import { SkillFormModel } from "@self-learning/types";
import { SkillTaskbar } from "./skill-taskbar";
import { FolderContext, SkillSelectHandler } from "./folder-editor";

function toSkillFormModel(dbSkill: SkillResolved): SkillFormModel {
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
							{/* <TableHeaderColumn>Kinder</TableHeaderColumn> */}
							<TableHeaderColumn>Bezeichnung</TableHeaderColumn>
							<TableHeaderColumn>Ebene</TableHeaderColumn>
							<TableHeaderColumn>Fremd-Skill</TableHeaderColumn>
							<TableHeaderColumn></TableHeaderColumn>
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
	onSelect
}: {
	skill: SkillResolved;
	depth: number;
	childrenFoldedOut: boolean;
	onSelect: SkillSelectHandler;
}) {
	const [openTaskbar, setOpenTaskbar] = useState<boolean>(false);
	const key = skill.id + "_" + depth + "_" + Math.floor(Math.random() * 10000000001);
	return (
		<tr
			key={key}
			// className={`bg-gray-${depth * 100}`}
			onMouseEnter={() => {
				setOpenTaskbar(true);
			}}
			onMouseLeave={() => {
				setOpenTaskbar(false);
			}}
		>
			<TableDataColumn
				className={`border- px-4 pl-7 text-sm ${
					depth % 2 === 0 ? "border-gray-400" : "border-gray-500"
				} `}
			>
				<div className="flex items-center"></div>
				{/* </TableDataColumn>
			<TableDataColumn> */}
				<div
					className="flex text-sm font-medium hover:text-secondary"
					style={{ cursor: "pointer" }}
					onClick={() => onSelect(toSkillFormModel(skill))}
				>
					<span>{skill.children.length !== 0 ? skill.children.length : ""}</span>
					<span></span>
					<div className="px-3">
						{skill.children.length > 0 ? (
							<>
								{" "}
								{childrenFoldedOut ? (
									<FolderDownloadIcon className="icon h-5 text-lg" />
								) : (
									<FolderIcon className="icon h-5 text-lg" />
								)}{" "}
							</>
						) : (
							<div className="px-2">•</div>
							// <DocumentTextIcon className="icon h-5 text-lg" />
						)}
					</div>
					<span>{skill.name}</span>
				</div>
			</TableDataColumn>
			<TableDataColumn>{depth}</TableDataColumn>
			<TableDataColumn>{skill.repository.name}</TableDataColumn>
			<TableDataColumn>
				<div className="flex flex-wrap justify-end gap-4">
					{openTaskbar && <SkillTaskbar selectedSkill={toSkillFormModel(skill)} />}
				</div>
			</TableDataColumn>
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
	const { handleSelection: onSelect } = useContext(FolderContext);
	const { data: skill, isLoading } = trpc.skill.getSkillById.useQuery({ skillId });
	const [open, setOpen] = useState(showChildren);

	const unfoldChildren: SkillSelectHandler = selectedSkill => {
		setOpen(!open);
		onSelect(selectedSkill);
	};

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
						onSelect={unfoldChildren}
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
