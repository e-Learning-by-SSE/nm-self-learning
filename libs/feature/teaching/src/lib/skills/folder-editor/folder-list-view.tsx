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
import { FolderIcon, PlusIcon, DocumentTextIcon, FolderDownloadIcon } from "@heroicons/react/solid";
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
		children: dbSkill.children?.map(child => child.id)
	};
}

function FolderListView({ repository }: { repository: SkillRepository }) {
	const [displayName, setDisplayName] = useState("");
	const [skillArray, setSkillArray] = useState<string[]>();
	const { data: skills } = trpc.skill.getUnresolvedSkillsFromRepo.useQuery({
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
	const { onSelect } = useContext(FolderContext);

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

			onSelect({ ...createdSkill, children: [] });
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
					<h1 className="text-5xl">SkillTrees</h1>
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
							<TableHeaderColumn>Name</TableHeaderColumn>
							<TableHeaderColumn></TableHeaderColumn>
						</>
					}
				>
					{filteredSkillTrees.map(element => (
						<ListSkillEntryWithChildrenMemorized
							key={"baseDir child:" + element}
							skillId={element}
							depth={1}
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

	return (
		<tr
			key={skill.id /* TODO: add uid */}
			className={`bg-gray-${depth * 100}`}
			onMouseEnter={() => {
				setOpenTaskbar(true);
			}}
			onMouseLeave={() => {
				setOpenTaskbar(false);
			}}
		>
			<TableDataColumn>
				<div className="flex items-center gap-4">
					{skill.children.length > 0 ? (
						<>
							{" "}
							{childrenFoldedOut ? (
								<FolderDownloadIcon className="icon h-5 text-lg hover:text-secondary" />
							) : (
								<FolderIcon className="icon h-5 text-lg hover:text-secondary" />
							)}{" "}
						</>
					) : (
						<DocumentTextIcon className="icon h-5 text-lg hover:text-secondary" />
					)}
					<div
						className="text-sm font-medium hover:text-secondary"
						style={{ cursor: "pointer" }}
						onClick={() => onSelect(toSkillFormModel(skill))}
					>
						{depth}.{skill.name}
					</div>
				</div>
			</TableDataColumn>
			<TableDataColumn>
				{openTaskbar && <SkillTaskbar selectedSkill={toSkillFormModel(skill)} />}
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
	const { onSelect } = useContext(FolderContext);
	const { data: skill, isLoading } = trpc.skill.getSkillById.useQuery({ skillId });
	const [open, setOpen] = useState(showChildren);

	const unfoldChildren = (selectedSkill: SkillFormModel) => {
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
