import {
	LoadingBox,
	Table,
	TableDataColumn,
	TableHeaderColumn,
	showToast
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import { useState, useMemo, memo, useEffect } from "react";

import {
	FolderIcon,
	PlusIcon,
	DocumentTextIcon,
	FolderDownloadIcon,
	TrashIcon
} from "@heroicons/react/solid";
import { trpc } from "@self-learning/api-client";
import { SkillRepository } from "@prisma/client";
import { SkillFormModel } from "@self-learning/types";
import { SkillSelectHandler } from "./folder-editor";
import { SkillResolved } from "@self-learning/api";

export function toSkillFormModel(dbSkill: SkillResolved): SkillFormModel {
	return {
		id: dbSkill.id,
		name: dbSkill.name,
		description: dbSkill.description,
		repositoryId: dbSkill.repositoryId,
		children: dbSkill.children?.map(child => child.id)
	};
}

function FolderListView({
	repository,
	onSelect
}: {
	repository: SkillRepository;
	onSelect: SkillSelectHandler;
}) {
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
						<ListElementMemorized
							key={"baseDir child:" + element}
							skillInfo={{ skillId: element, repoId: repository.id }}
							color={0 * 100}
							depth={1}
							onSelect={onSelect}
						/>
					))}
				</Table>
			</CenteredSection>
		</div>
	);
}

export default memo(FolderListView);

export const ListElementMemorized = memo(ListElement);

function ListElement({
	skillInfo,
	depth,
	onSelect,
	color
}: {
	skillInfo: { skillId: string; repoId: string };
	depth: number;
	onSelect: SkillSelectHandler;
	color: number;
}) {
	const [open, setOpen] = useState<boolean>(false);
	const [openTaskbar, setOpenTaskbar] = useState<boolean>(false);
	const [refreshData, setRefreshData] = useState<boolean>(false);

	const { data: skill, isLoading } = trpc.skill.getSkillById.useQuery({
		skillId: skillInfo.skillId
	});

	const { mutateAsync: createSkill } = trpc.skill.createSkill.useMutation();
	const { mutateAsync: updateSkill } = trpc.skill.updateSkill.useMutation();
	// const { mutateAsync: deleteSkill } = trpc.skill.deleteSkill.useMutation();

	const addSkill = async () => {
		if (isLoading) return;
		if (!skill) return;

		const newSkill = {
			name: skill.name + " Child",
			description: "Add here",
			children: []
		};

		try {
			const createdSkill = await createSkill({ repId: skillInfo.repoId, skill: newSkill });
			const adaptedCurrentSkill: SkillFormModel = {
				...skill,
				children: [...skill.children.map(child => child.id), createdSkill.id]
			};

			try {
				await updateSkill({ skill: adaptedCurrentSkill });
				setRefreshData(!refreshData);
				showToast({
					type: "success",
					title: "Skill gespeichert!",
					subtitle: ""
				});
			} catch (error) {
				if (error instanceof Error) {
					showToast({
						type: "error",
						title: "Skill konnte nicht gespeichert werden!",
						subtitle: error.message ?? ""
					});
				}
				// await deleteSkill({ id: createdSkill.id });
			}
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

	const deleteThisSkill = async () => {
		if (isLoading) return;
		if (!skill) return;

		try {
			// await deleteSkill({ id: skillInfo.skillId });
			showToast({
				type: "success",
				title: "Skill gelöscht!",
				subtitle: ""
			});
			setRefreshData(!refreshData);
		} catch (error) {
			if (error instanceof Error) {
				showToast({
					type: "error",
					title: "Skill konnte nicht gelöscht werden!",
					subtitle: error.message ?? ""
				});
			}
		}
	};

	return (
		// eslint-disable-next-line react/jsx-no-useless-fragment
		<>
			{isLoading ? (
				<LoadingBox />
			) : (
				// eslint-disable-next-line react/jsx-no-useless-fragment
				<>
					{skill && (
						<>
							<tr
								key={skill.id /* TODO: add uid */}
								className={`bg-gray-${color}`}
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
												{open ? (
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
											onClick={() => {
												setOpen(!open);
												onSelect(toSkillFormModel(skill));
											}}
										>
											{depth}.{skill.name}
										</div>
									</div>
								</TableDataColumn>
								<TableDataColumn>
									<div className="flex flex-wrap justify-end gap-4">
										{openTaskbar && (
											<>
												<PlusIcon
													className="icon h-5 text-lg hover:text-secondary"
													style={{ cursor: "pointer" }}
													onClick={() => {
														addSkill();
													}}
												/>
												<TrashIcon
													className="icon h-5 text-lg hover:text-red-500"
													style={{ cursor: "pointer" }}
													onClick={() => {
														deleteThisSkill();
													}}
												/>
											</>
										)}
									</div>
								</TableDataColumn>
							</tr>
							{open &&
								skill.children.length > 0 &&
								skill.children.map(element => (
									<ListElementMemorized
										skillInfo={{
											skillId: element.id,
											repoId: skillInfo.repoId
										}}
										color={depth * 100}
										onSelect={onSelect}
										depth={depth + 1}
									/>
								))}
						</>
					)}
				</>
			)}
		</>
	);
}
