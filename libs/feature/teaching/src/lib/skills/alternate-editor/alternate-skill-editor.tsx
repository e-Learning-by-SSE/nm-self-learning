import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { Skills } from '@self-learning/types';
import AlternateSkillEditorRightSide from './alternate-skill-editorRightSide';
import { RepInfoFormMemorized, SkillInfoForm } from './alternate-skill-info-form';
import { useState } from 'react';
import { trpc } from '@self-learning/api-client';
import { Divider, LoadingBox } from '@self-learning/ui/common';
import { SkillDto, SkillRepositoryCreationDto, UnresolvedSkillRepositoryDto } from '@self-learning/competence-rep';



const getRepositoryCreationDto = (unresolvedRep: UnresolvedSkillRepositoryDto) => {
    return ({
        owner: unresolvedRep.owner,
        name: unresolvedRep.name,
        description: unresolvedRep.description,
        } as SkillRepositoryCreationDto )
}


export function AlternateSkillEditor({
    repositoryID,
    onConfirm
}: {
    repositoryID: string
    onConfirm: (skilltree: Skills) => void;
}) {

    
    const { data: skillTrees, isLoading } =  trpc.skill.getUnresolvedSkillsFromRepo.useQuery({ id: repositoryID });


    const [selectedItem, setSelectedItem] = useState<SkillDto|null>(null);


    const changeSelectedItem = (item: SkillDto) => {
        setSelectedItem(item);
    }


    return(
        <div className="bg-gray-50">
                    <SidebarEditorLayout
                        sidebar={
                            <>
                                <div>
                                    <span className="font-semibold text-secondary text-2xl">
                                        Skilltree editieren
                                    </span>
                                </div>


                                {isLoading ? (
                                    <LoadingBox />
                                        ) : (
                                            // eslint-disable-next-line react/jsx-no-useless-fragment
                                            <>
                                                {skillTrees && (
                                                    <>
                                                        <RepInfoFormMemorized repository={getRepositoryCreationDto(skillTrees)} />
                                                        <Divider /> 
                                                    </>
                                                )}
                                            </>
                                )}
                                <SkillInfoForm skill={selectedItem}/>
                             
                            </>
                        } >
                            {isLoading ? (
                                <LoadingBox />
                            ) : (
                                <div>
                                    {skillTrees && (
                                        <AlternateSkillEditorRightSide unresolvedRep={skillTrees} changeSelectedItem={changeSelectedItem} onConfirm={onConfirm} />
                                    )}
                                </div>
                            )}
                    </SidebarEditorLayout>

        </div>
            
    );



}
