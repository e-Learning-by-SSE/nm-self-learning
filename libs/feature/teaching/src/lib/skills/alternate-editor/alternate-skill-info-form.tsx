import React, {  useState, useEffect, useMemo } from 'react';
import { Skills } from '@self-learning/types';
import { Form,  LabeledField} from "@self-learning/ui/forms";
import { useFormContext } from 'react-hook-form';

export function SkillInfoForm(
    { skill }: { skill: Skills|null }
) {
    
    const { register } = useFormContext<Skills>();

    const getSkillOrDefault = useMemo(() => {
      if (skill === null) {
        return {
          id: '1',
          nestedSkills: [],
          name: 'test',
          level: 1,
          description: 'test',
        };
      } else {
        return skill;
      }
    }, [skill]);

    const [currentSkill, setCurrentSkill] = useState<Skills>(getSkillOrDefault);

    useEffect(() => {
      setCurrentSkill(getSkillOrDefault);
    }, [getSkillOrDefault, skill]);
  


    return (
      <Form.SidebarSection>
            <Form.SidebarSectionTitle title="Daten" subtitle="Informationen über diesen Skill" />
            <div className="flex flex-col gap-4">
        <LabeledField label="Name">
          <input
            type="text"
            className='textfield'
            value={currentSkill.name}
            {...register('name')}
          />
        </LabeledField>
        <LabeledField label="Nested Skills">
          <input
            type="text"
            className='textfield'
            value={currentSkill.nestedSkills.map((element) => element.name).join(', ')}
            {...register('nestedSkills')}
          />
        </LabeledField>
        <LabeledField label="Beschreibung">
          <textarea
            value={currentSkill.description}
            {...register('description')}
          />
        </LabeledField>
      </div>
        </Form.SidebarSection>
    );
}
