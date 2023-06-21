import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { Skills, skillsSchema, convertNestedSkillsToArray } from '@self-learning/types';
import { CourseFormModel } from '@self-learning/teaching';
import { courseFormSchema } from '@self-learning/teaching';
import { OpenAsJsonButton } from "../json-editor-dialog";
import FlowLayoutEditor from './layout-editor/flow-layout-editor';
import { log } from 'console';
import { SkillInfoForm } from './skill-info-form';


export function SkillEditor({
    skilltree,
    onConfirm
}: {
    skilltree: Skills
    onConfirm: (skilltree: Skills) => void;
}) {

    const form = useForm<Skills>({
		defaultValues: { ...skilltree },
		resolver: zodResolver(skillsSchema)
	});

    const isNew = false; //edit

    const skillArray = convertNestedSkillsToArray(skilltree);


// create schema + model

    return(
        <div className="bg-gray-50">
            <FormProvider {...form}>
                <form
                    id="skilltreeform"
                    onSubmit={e => {
                        if ((e.target as unknown as { id: string }).id === "skilltreeform") {
                            form.handleSubmit(
                                data => {
                                    console.log("data", data);
                                    try {
                                        const validated = skillsSchema.parse(data);
                                        onConfirm(validated);
                                    } catch (error) {
                                        console.error(error);
                                    }
                                },
                                invalid => {
                                    console.log("invalid", invalid);
                                }
                            )(e);
                        }
                    }}
                >
                    <SidebarEditorLayout
                        sidebar={
                            <>
                                <div>
                                    <span className="font-semibold text-secondary">
                                        Skilltree editieren
                                    </span>

                                    <h1 className="text-2xl">Test Titel</h1>
                                </div>

                                <OpenAsJsonButton form={form} validationSchema={courseFormSchema} />

                                <button className="btn-primary w-full" type="submit">
									{isNew ? "Erstellen" : "Speichern"}
								</button>

                                <SkillInfoForm />
                            </>
                        } >
                            <FlowLayoutEditor onFinished={(data: Skills) => {console.log('data')}} 
                            skills={skillArray} />
                    </SidebarEditorLayout>
                </form>
                    

            </FormProvider>

        </div>
            
    );











}
