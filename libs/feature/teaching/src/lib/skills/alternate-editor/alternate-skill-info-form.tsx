import React, {  useState, useEffect, useMemo } from 'react';
import { Form,  LabeledField} from "@self-learning/ui/forms";
import { SkillDto } from '@self-learning/competence-rep';

export function SkillInfoForm(
    { skill }: { skill: SkillDto|null }
) {

    const getSkillOrDefault = useMemo(() => {
      if (skill === null) {
        return {
          id: '1',
          nestedSkills: [],
          repositoryId: '1',
          name: 'test',
          level: 1,
          description: 'test',
        } as SkillDto;
      } else {
        return skill;
      }
    }, [skill]);

    const [currentSkill, setCurrentSkill] = useState<SkillDto>(getSkillOrDefault);

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
            onChange={() => {}}
          />
        </LabeledField>
        <LabeledField label="Untergeordnete Skills">
          <input
            type="text"
            className='textfield'
            value={currentSkill.nestedSkills.map((element: string) => element).join(', ')}
            onChange={() => {}}
          />
        </LabeledField>
        <LabeledField label="Level">
          <input
            type="text"
            className='textfield'
            value={currentSkill.level}
            onChange={() => {}}
          />
        </LabeledField>
        <LabeledField label="Beschreibung">
          <textarea
            value={currentSkill.description}
            onChange={() => {}}
          />
        </LabeledField>
      </div>
        </Form.SidebarSection>
    );
}
