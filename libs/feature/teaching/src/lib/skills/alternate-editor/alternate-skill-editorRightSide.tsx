
import {
	LoadingBox,
	Table,
	TableDataColumn,
	TableHeaderColumn,
	showToast
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import { useState, useMemo, memo} from "react";

import { FolderIcon, PlusIcon, DocumentTextIcon, FolderDownloadIcon, TrashIcon } from "@heroicons/react/solid";
import { SkillCreationDto, SkillDto, UnresolvedSkillRepositoryDto } from "@self-learning/competence-rep";
import { trpc } from "@self-learning/api-client";

export default memo(AlternateSkillEditorRightSide);

function AlternateSkillEditorRightSide({
    unresolvedRep,
	changeSelectedItem
} : {
    unresolvedRep: UnresolvedSkillRepositoryDto,
	changeSelectedItem: (skilltree: SkillDto) => void;
}) {

	

    const [displayName, setDisplayName] = useState("");

	const [skillArray, setSkillArray] = useState<string[]>(unresolvedRep.skills);

	const filteredSkillTrees = useMemo(() => {
		if (!skillArray) return [];
		if (!displayName || displayName.length === 0) return skillArray;

		const lowerCaseDisplayName = displayName.toLowerCase().trim();
		return skillArray.filter(skill =>
			skill.toLowerCase().includes(lowerCaseDisplayName)
		);
	}, [skillArray, displayName]);



	//create skills
	const { mutateAsync: createSkill } =  trpc.skill.createSkill.useMutation();

	const createSkillAndSubmit = async () => {
		console.log(unresolvedRep)
		const newSkill = {
			owner: unresolvedRep.owner,
			name: "New Skill: " + Date.now(),
			level: 0,
			description: "",
			nestedSkills: []
		} as SkillCreationDto

		try {
			const createdSkill = await createSkill({repId: unresolvedRep.id, skill: newSkill});
			showToast({
				type: "success",
				title: "Skill gespeichert!",
				subtitle: ""
			});
			changeSelectedItem(createdSkill);
			setSkillArray([...skillArray, createdSkill.id]);
		} catch (error) {
			if(error instanceof Error) {
				showToast({
					type: "error",
					title: "Skill konnte nicht gespeichert werden!",
					subtitle: error.message ?? ""
				});
			}
		}
	}



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
					onChange={e => {setDisplayName(e.target.value)}}
				/>

				<Table
					head={
						<>
							<TableHeaderColumn>Name</TableHeaderColumn>
							<TableHeaderColumn></TableHeaderColumn>
						</>
					}
				>
					{filteredSkillTrees.map((element) => (
						<ListElementMemorized key={ "baseDir child:" + element} skillInfo={{skillId: element, repoId: unresolvedRep.id}} 
							color={0 * 100} 
							owner={unresolvedRep.owner}
							level={1}
							changeSelectedItem={changeSelectedItem} />
					))}
					
				</Table>
				
			</CenteredSection>
        </div>
    );
}

//used memo to prevent rerendering of the form
export const ListElementMemorized = memo(ListElement);

export function ListElement({
	skillInfo,
	level,
	changeSelectedItem,
	owner,
	color
} : {
	skillInfo: {skillId: string, repoId: string},
	level: number,
	owner: string
	changeSelectedItem: (skilltree: SkillDto) => void,
	color: number
}) {

	const [open, setOpen] = useState<boolean>(false);
	const [openTaskbar, setOpenTaskbar] = useState<boolean>(false);
	const [refreshData, setRefreshData] = useState<boolean>(false);
	
	//get skills from id
	const { data: skill, isLoading } =  trpc.skill.getSkillFromId.useQuery({id: skillInfo.skillId});

	//create delete and update skills
	const { mutateAsync: createSkill } =  trpc.skill.createSkill.useMutation();
	const { mutateAsync: updateSkill } =  trpc.skill.changeSkillById.useMutation();
	const { mutateAsync: deleteSkill } =  trpc.skill.deleteSkill.useMutation();
	

	const addSkill = async () => {
		if(isLoading) return;
		if(!skill) return;

		const newSkill = {
			owner: owner,
			name: skill.name,
			level: skill.level,
			description: skill.description ?? "",
			nestedSkills: []
		} as SkillCreationDto

		const adaptedCurrentSkill = {
			owner: owner,
			name: skill.name,
			level: skill.level,
			description: skill.description ?? "",
			nestedSkills: [...skill.nestedSkills, newSkill]
		} as SkillCreationDto

		try {

			const createdSkill = await createSkill({repId: skillInfo.repoId, skill: newSkill});

			try {

				await updateSkill({repoId: skillInfo.repoId, skill: adaptedCurrentSkill});
				setRefreshData(!refreshData);
				showToast({
					type: "success",
					title: "Skill gespeichert!",
					subtitle: ""
				});

			} catch (error) {
				if(error instanceof Error) {
					showToast({
						type: "error",
						title: "Skill konnte nicht gespeichert werden!",
						subtitle: error.message ?? ""
					});
				}
				await deleteSkill({id: createdSkill.id});
			}
		} catch (error) {
			if(error instanceof Error) {
				showToast({
					type: "error",
					title: "Skill konnte nicht gespeichert werden!",
					subtitle: error.message ?? ""
				});
			}
		}
		
	}

	const deleteThisSkill = async () => {
		if(isLoading) return;
		if(!skill) return;

		try {
			
			await deleteSkill({id: skillInfo.skillId});
			
			showToast({
				type: "success",
				title: "Skill gelöscht!",
				subtitle: ""
			});
			setRefreshData(!refreshData);
		} catch(error) {
			if(error instanceof Error) {
				showToast({
					type: "error",
					title: "Skill konnte nicht gelöscht werden!",
					subtitle: error.message ?? ""
				});
			}

		}

	}

	
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
							<tr key={skill.id + skill.level} 
							className={`bg-gray-${color}`}
							onMouseEnter={() => {setOpenTaskbar(true)}}
							onMouseLeave={() => {setOpenTaskbar(false)}}>
								<TableDataColumn>
								<div className="flex items-center gap-4">
									{skill.nestedSkills.length > 0 ?
										<> {open ?  <FolderDownloadIcon className="icon h-5 text-lg hover:text-secondary" /> :
										<FolderIcon className="icon h-5 text-lg hover:text-secondary" />} </>:
									<DocumentTextIcon className="icon h-5 text-lg hover:text-secondary" />}
										<div className="text-sm font-medium hover:text-secondary" style={{cursor: "pointer"}} 
										onClick={() => {setOpen(!open); changeSelectedItem(skill)}} >
											{level}. {skill.name}
										</div>
									</div>
								</TableDataColumn>
							<TableDataColumn>
								<div className="flex flex-wrap justify-end gap-4">
									{openTaskbar && (
										<><PlusIcon className="icon h-5 text-lg hover:text-secondary"
													style={{ cursor: "pointer" }}
													onClick={() => { addSkill() } } />
										<TrashIcon className="icon h-5 text-lg hover:text-red-500" 
										style={{ cursor: "pointer" }}
										onClick={() => {deleteThisSkill()}}/></>
									)}
								</div>
							</TableDataColumn>
							</tr>
							{open && skill.nestedSkills.length > 0 && (
								skill.nestedSkills.map((element) =>
								<ListElementMemorized key={skill.id + skill.level + "child:" + element} skillInfo={{skillId: element, repoId: skillInfo.repoId}}
									changeSelectedItem={changeSelectedItem}
									color={(skill.level) * 100}
									owner={owner}
									level={level + 1} 
									/>
								)
							)}
							</>
						)}
					</>	
			)}	
		</>
	);
}

  



  