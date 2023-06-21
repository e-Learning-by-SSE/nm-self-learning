import React, {  useState } from 'react';
import { Skills } from '@self-learning/types';
import { Form,  LabeledField} from "@self-learning/ui/forms";
import { useFormContext } from 'react-hook-form';
import { set } from 'date-fns';

export function SkillInfoForm() {

    const form = useFormContext<Skills[] & { content: unknown[] }>(); // widen content type to prevent circular path error
	const {
		register,
		control,
		formState: { errors }
	} = form;

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, name: string) => {
        event.dataTransfer.setData('application/reactflow', name);
        event.dataTransfer.effectAllowed = 'move';
      };

      const [inputSkill, setInputSkill] = useState<string>("");


    return (
        <Form.SidebarSection>
            <Form.SidebarSectionTitle title="Daten" subtitle="Informationen über diesen Kurs." />
                <div className="flex flex-col gap-4">
                    <LabeledField label="Select Skill">
                        <input
                            type="text"
                            className="textfield"
                            placeholder=""
                            onChange={(e) => setInputSkill(e.target.value)}
                        />
                    </LabeledField>
                    <div className="dndnode"  onDragStart={(event) => onDragStart(event, inputSkill)} draggable>
                        {inputSkill}
                    </div>
                </div>
        </Form.SidebarSection>
    );
}

