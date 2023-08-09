import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import AlternateSkillEditorRightSide from './alternate-skill-editorRightSide';
import { RepInfoFormMemorized, SkillInfoForm } from './alternate-skill-info-form';
import { useState } from 'react';
import { trpc } from '@self-learning/api-client';
import { Divider, LoadingBox } from '@self-learning/ui/common';
import { SkillDto, SkillRepositoryDto, UnresolvedSkillRepositoryDto } from '@self-learning/competence-rep';



const getRepositoryDto = (unresolvedRep: UnresolvedSkillRepositoryDto) => {
    return ({
        owner: unresolvedRep.owner,
        id: unresolvedRep.id,
        taxonomy: unresolvedRep.taxonomy,
        description: unresolvedRep.description,
        access_rights: unresolvedRep.access_rights,
        name: unresolvedRep.name,
        version: unresolvedRep.version,
        } as SkillRepositoryDto )
}


export function AlternateSkillEditor({
    repositoryID
}: {
    repositoryID: string
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
                                                        <RepInfoFormMemorized repository={getRepositoryDto(skillTrees)} />
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
                                        <AlternateSkillEditorRightSide unresolvedRep={skillTrees} changeSelectedItem={changeSelectedItem} />
                                    )}
                                </div>
                            )}
                    </SidebarEditorLayout>

        </div>
            
    );



}
