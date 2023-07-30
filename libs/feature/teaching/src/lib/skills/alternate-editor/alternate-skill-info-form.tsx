import { useState, useEffect, useMemo, memo } from 'react';
import { Form, LabeledField } from "@self-learning/ui/forms";
import { SkillCreationDto, SkillDto, SkillRepositoryCreationDto } from '@self-learning/competence-rep';
import { zodResolver } from '@hookform/resolvers/zod';
import { skillRepositoryCreationDtoSchema } from 'libs/data-access/openapi-client/src/models/SkillRepositoryCreationDto';
import { FormProvider, useForm } from 'react-hook-form';
import { SkillCreationFormModel, skillCreationFormSchema } from '@self-learning/types';
import { useSession } from 'next-auth/react';



export function SkillInfoForm(
    { skill }: { skill: SkillDto | null }
) {

    const session = useSession();

    const getSkillOrDefault = useMemo(() => {
      if (skill === null) {
        return {
          owner: "",
          name: "",
          level: 0,
          description: "",
          nestedSkills: [],
        } as SkillCreationFormModel;
      } else {
        return {
          owner: session.data?.user.id,
          name: skill.name,
          level: skill.level,
          description: skill.description,
          nestedSkills: skill.nestedSkills,
          } as SkillCreationFormModel;
      }
    }, [session.data?.user.id, skill]);

    const [currentSkill, setCurrentSkill] = useState<SkillCreationFormModel>(getSkillOrDefault);

    useEffect(() => {
      setCurrentSkill(getSkillOrDefault);
    }, [getSkillOrDefault, skill]);

    const form = useForm ({ 
      defaultValues: currentSkill,
      resolver: zodResolver(skillCreationFormSchema),
    });

    const errors = form.formState.errors;
  
    const onSubmit = (data: SkillCreationFormModel) => {
      console.log(data);
    }
    console.log("render")

    return (
      <FormProvider {...form}>
        <form className="flex flex-col justify-between" onSubmit={form.handleSubmit(onSubmit)}>
          <Form.SidebarSection>
            <Form.SidebarSectionTitle title="Skill - Daten" subtitle="Informationen über den rechts ausgewählten Skill" />
            <div className="flex flex-col gap-4">
              <LabeledField label="Name" error={errors.name?.message}>
                <input
                  type="text"
                  className='textfield'
                  value={currentSkill.name}
                  {...form.register('name')}
                />
              </LabeledField>
              <LabeledField label="Level" error={errors.level?.message}>
                <input
                  type="text"
                  className='textfield'
                  value={currentSkill.level}
                  {...form.register('level')}
                />
              </LabeledField>
              <LabeledField label="Beschreibung" error={errors.description?.message}>
                <textarea
                  value={currentSkill.description}
                  {...form.register('description')}
                />
              </LabeledField>
              <LabeledField label="Abhängig von:">
                <input
                  type="text"
                  className='textfield'
                  readOnly
                  value={currentSkill.nestedSkills.map((element: string) => element).join(', ')}
                />
              </LabeledField>
              <div className="flex justify-between">
              <button type="submit" className="btn-primary w-full" >
                Speichern
              </button>
            </div>
            </div>
          </Form.SidebarSection>
        </form>
      </FormProvider>
    );
}


//used memo to prevent rerendering of the form
export const RepInfoFormMemorized = memo(RepInfoForm);

function RepInfoForm(
    { repository }: { repository: SkillRepositoryCreationDto}
) {


  const form = useForm ({
    defaultValues: repository,
    resolver: zodResolver(skillRepositoryCreationDtoSchema),
  });
  const errors = form.formState.errors;

  const onSubmit = (data: SkillRepositoryCreationDto) => {
    console.log(data);
    //TODO: send data to backend
  }


  return (
    <FormProvider {...form}>
      <form className="flex flex-col justify-between" onSubmit={form.handleSubmit(onSubmit)}>
        <Form.SidebarSection>
          <Form.SidebarSectionTitle title="Repositorie - Daten" subtitle="Informationen über das Repositorie" />
          <div className="flex flex-col gap-4">
            <LabeledField label="Name"  error={errors.name?.message}>
              <input
                type="text"
                className='textfield'
                {...form.register('name')}
              />
            </LabeledField>
            <LabeledField label="Beschreibung" error={errors.description?.message}>
              <input
                type="text"
                className='textfield'
                {...form.register('description')}
              />
            </LabeledField>
            <div className="flex justify-between">
              <button type="submit" className="btn-primary w-full" >
                Speichern
              </button>
            </div>
          </div>
         </Form.SidebarSection>
      </form>
    </FormProvider>

  )

}


    
