import React from 'react';
import { Skills } from '@self-learning/types';
import { Form, InputWithButton, LabeledField} from "@self-learning/ui/forms";
import { useFormContext } from 'react-hook-form';

export function SkillInfoForm() {

    const form = useFormContext<Skills[] & { content: unknown[] }>(); // widen content type to prevent circular path error
	const {
		register,
		control,
		formState: { errors }
	} = form;

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
      };


    return (
        <Form.SidebarSection>
            <Form.SidebarSectionTitle title="Daten" subtitle="Informationen über diesen Kurs." />
                <div className="flex flex-col gap-4">
                    <LabeledField label="Titel">
                        <input
                            type="text"
                            className="textfield"
                            placeholder=""
                        />
                    </LabeledField>
                    <div className="dndnode"  onDragStart={(event) => onDragStart(event, 'input')} draggable>
                        TestNodeDragAndDrop
                    </div>
                </div>
        </Form.SidebarSection>
    );
}

 /*
   <div className="flex flex-col gap-4">
                    <LabeledField label="Titel" error={errors.name?.message}>
                        <input
                            {...register("name")}
                            type="text"
                            className="textfield"
                            placeholder=""
                        />
                    </LabeledField>
                    <div>
                    */ 