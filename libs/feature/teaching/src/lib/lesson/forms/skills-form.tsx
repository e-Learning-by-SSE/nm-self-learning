/* eslint-disable react/jsx-no-useless-fragment */
import { trpc } from "@self-learning/api-client";
import { SkillFormModel, SkillRepositoryModel } from "@self-learning/types";
import { IconButton, LoadingBox, TextChip } from "@self-learning/ui/common";
import { Form, LabeledField} from "@self-learning/ui/forms";
import { memo, use, useEffect, useState } from "react";
import { SelectSkillDialog } from "../../skills/skill-dialog/select-skill-dialog";
import { PlusIcon } from "@heroicons/react/solid";
import { useFormContext } from "react-hook-form";
import { LessonFormModel } from "../lesson-form-model";



export default function SkillForm() {

    const { setValue, watch } = useFormContext<LessonFormModel>();

    const requirementSkills = watch("requirements");
    const teachingGoals = watch("teachingGoals");

    const [ selectedRepository, setSelectedRepository ] = useState<SkillRepositoryModel | null>(null);
    const [selectSkillModal , setSelectSkillModal] = useState<{ id: "TEACHING"| "REQUIREMENT"} | null>(null);


    const selectRepository = (id: SkillRepositoryModel) => {
        setSelectedRepository(id);
    }

    const addSkills = (skill: SkillFormModel[] | undefined, id: "TEACHING"| "REQUIREMENT") => {
        if(!skill) return;
        skill = skill.map(skill => ({...skill, children: []}));
        if(id === "TEACHING") {
            setValue("teachingGoals", [...teachingGoals, ...skill]);
        } else {
            setValue("requirements", [...requirementSkills, ...skill]);
        }
    }

    const deleteSkill = (skill: SkillFormModel, id: "TEACHING"| "REQUIREMENT") => {
        if(id === "TEACHING") {
            setValue("teachingGoals", teachingGoals.filter(s => s.id !== skill.id));
        } else {
            setValue("requirements", requirementSkills.filter(s => s.id !== skill.id));
        }
    }

    return(
        <Form.SidebarSection>
            <Form.SidebarSectionTitle
                title="Skills"
                subtitle="Vermittelte und Benötigte Skills dieser Lerneinheit"
            />
            <LinkedSkillRepositoryMemorized selectRepository={selectRepository} />
            {selectedRepository &&
                <>
                    <LabeledField label="Vermittelte Skills">
                        <IconButton
                            type="button"
                            data-testid="VermittelteSkills-add"
                            onClick={() => setSelectSkillModal({id: "TEACHING"})}
                            title="Hinzufügen"
                            text="Hinzufügen"
                            icon={<PlusIcon className="h-5" />}
                        />
                        <SkillList skills={teachingGoals} deleteSkill={(skill) => {deleteSkill(skill, "TEACHING")}} />
                    </LabeledField>
                    <LabeledField label="Benötigte Skills">
                        <IconButton
                            type="button"
                            data-testid="BenoetigteSkills-add"
                            onClick={() => setSelectSkillModal({id: "REQUIREMENT"})}
                            title="Hinzufügen"
                            text="Hinzufügen"
                            icon={<PlusIcon className="h-5" />}
                        />
                        <SkillList skills={requirementSkills} deleteSkill={(skill) => {deleteSkill(skill, "REQUIREMENT")}} />
                    </LabeledField>
                    {selectSkillModal && 
                        <SelectSkillDialog onClose={(skill) => {setSelectSkillModal(null); addSkills(skill, selectSkillModal.id)}} repositoryId={selectedRepository.id} />
                    }
                </>
            }
		</Form.SidebarSection>

    );

}

const LinkedSkillRepositoryMemorized = memo(LinkedSkillRepository);

function LinkedSkillRepository({
    selectRepository
}: {
    selectRepository: (id: SkillRepositoryModel) => void
}) {

    // TODO Make a method to get a smaller version of the repository
    const { data: repositories, isLoading }  = trpc.skill.getRepositories.useQuery();

    const [ selectedRepository, setSelectedRepository ] = useState<SkillRepositoryModel | null>(null);

    const onChange = (id: string) => {
        if(repositories) {
            const selectedRepository = repositories.find(repository => repository.id === id);
            if(selectedRepository) {
                selectRepository(selectedRepository);
                setSelectedRepository(selectedRepository);
            }
        }
    }

    useEffect(() => {
        if(repositories && repositories.length > 0) {
            selectRepository(repositories[0]);
            setSelectedRepository(repositories[0]);
        }
    }, [repositories, selectRepository])

    

    return(
        <>
        {isLoading ? <LoadingBox /> : 
            <>
            {repositories && repositories.length > 0 &&
                <LabeledField label="Verlinkte Skill-Repositories">
                    <select
                    className="textfield w-64 rounded-lg px-8"
                    value={selectedRepository?.id ?? repositories[0].id}
                    onChange={e => onChange(e.target.value)}
                    >   
                        {repositories.map(repository => (
                            <option
                                key={repository.id}
                                value={repository.id}
                            >
                                {repository.name}
                            </option>
                        ))}
                    </select>
                </LabeledField>}
            </>
        }
        </>

    )

}

function SkillList({
    skills,
    deleteSkill
}: {
    skills: SkillFormModel[],
    deleteSkill: (skill: SkillFormModel) => void
}) {

    return(
        <>
            {skills.length === 0 ? (
                <p className="text-sm text-light mt-3 text-center">Keinen Skill hinzugefügt</p>
            ) : (
                <ul className="grid gap-4  mt-3 max-h-40 overflow-auto">
                    {skills.map((skill, index) => (
                        <TextChip
                            key={skill.id + index}
                            onRemove={() => deleteSkill(skill)}
                        >
                            <div className="flex text-center" >
                                <span>
                                    {skill.name}
                                </span>
                            </div>
                        </TextChip>

                    ))}
                </ul>
            )}
        </>
    )


}








