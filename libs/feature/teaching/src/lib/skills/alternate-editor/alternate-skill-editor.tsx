import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { Skills, skillsSchema, convertNestedSkillsToArray } from '@self-learning/types';
import { CourseFormModel } from '@self-learning/teaching';
import AlternateSkillEditorRightSide from './alternate-skill-editorRightSide';
import { SkillInfoForm } from './alternate-skill-info-form';
import { useState } from 'react';
import { trpc } from '@self-learning/api-client';
import { LoadingBox } from '@self-learning/ui/common';
import { SkillDto } from '@self-learning/competence-rep';


export function AlternateSkillEditor({
    repositoryID,
    onConfirm
}: {
    repositoryID: string
    onConfirm: (skilltree: Skills) => void;
}) {

    
    const { data: skillTrees, isLoading } =  trpc.skill.getUnresolvedSkillsFromRepo.useQuery({ id: repositoryID });

    const isNew = true; 

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
                                    <span className="font-semibold text-secondary">
                                        Skilltree editieren
                                    </span>

                                    <h1 className="text-2xl">Test Titel</h1>
                                </div>


                                <button className="btn-primary w-full" onClick={() => {/* change default skill */}}>
									{isNew ? "Erstellen" : "Speichern"}
								</button>
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
