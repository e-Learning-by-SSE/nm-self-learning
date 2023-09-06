import { useContext, useEffect, useState } from "react";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { SkillFormModel, skillFormSchema } from "@self-learning/types";
import { trpc } from "@self-learning/api-client";
import { SkillResolved } from "@self-learning/api";
import { PlusCircleIcon, XIcon } from "@heroicons/react/solid";
import { FolderContext } from "./folder-editor";
import { SkillDeleteOption } from "./skill-taskbar";
import { showToast } from "@self-learning/ui/common";

export function SkillInfoForm({ skill }: { skill: SkillFormModel }) {
	const { mutateAsync: updateSkill } = trpc.skill.updateSkill.useMutation();
	const { data: dbSkill } = trpc.skill.getSkillById.useQuery({
		skillId: skill.id
	});

	const onSubmit = (data: SkillFormModel) => {
		updateSkill({
			skill: {
				...data,
				repositoryId: skill.repositoryId,
				id: skill.id,
				// don't use the form values. parents|children are changed from inside the dependency info component
				children: skill.children,
				parents: skill.parents
			}
		});
		showToast({
			type: "success",
			title: "Skill gespeichert!",
			subtitle: ""
		});
	};

	const form = useForm({
		defaultValues: skill,
		resolver: zodResolver(skillFormSchema)
	});

	const errors = form.formState.errors;

	useEffect(() => {
		form.setValue("name", skill.name);
		form.setValue("description", skill?.description);
	}, [skill, form]);

	const { handleSelection } = useContext(FolderContext);
	return (
		<FormProvider {...form}>
			<form className="flex flex-col justify-between" onSubmit={form.handleSubmit(onSubmit)}>
				<Form.SidebarSection>
					<div className="flex justify-between">
						<Form.SidebarSectionTitle
							title="Bearbeiten"
							subtitle="Informationen über den rechts ausgewählten Skill"
						/>
						<button
							type="button"
							className="h-fit rounded-lg border border-light-border bg-white px-2 py-2"
							title="Ansicht ohne Veränderungen schließen"
							onClick={() => handleSelection(null)}
						>
							<XIcon className="h-5" />
						</button>
					</div>
					<div className="flex flex-col gap-4">
						<LabeledField label="Name" error={errors.name?.message}>
							<input type="text" className="textfield" {...form.register("name")} />
						</LabeledField>
						<LabeledField label="Beschreibung" error={errors.description?.message}>
							<textarea {...form.register("description")} />
						</LabeledField>
						<SkillToSkillDepsInfo
							parents={dbSkill?.parents ?? []}
							children={dbSkill?.children ?? []}
							skillToChange={skill}
						/>
						<button type="submit" className="btn-primary w-full">
							Speichern
						</button>
						<SkillDeleteOption skill={skill} />
					</div>
				</Form.SidebarSection>
			</form>
		</FormProvider>
	);
}

function SkillToSkillDepsInfo({
	parents,
	children,
	skillToChange
}: {
	parents: SkillResolved["parents"];
	children: SkillResolved["children"];
	skillToChange: SkillFormModel;
}) {
	const { handleSelection } = useContext(FolderContext);
	const [parentItems, setParentItems] = useState<SkillResolved["parents"]>(parents);
	const [childItems, setChildItems] = useState<SkillResolved["children"]>(children);
	useEffect(() => {
		setParentItems(parents);
	}, [parents]);

	useEffect(() => {
		setChildItems(children);
	}, [children]);

	const removeParent = (id: string) => {
		setParentItems(parentItems.filter(item => item.id !== id));
		skillToChange.parents = skillToChange.parents.filter(item => item !== id);
	};
	const removeChild = (id: string) => {
		setChildItems(childItems.filter(item => item.id !== id));
		skillToChange.children = skillToChange.children.filter(item => item !== id);
	};

	return (
		<>
			<label>
				<span className="text-sm font-semibold">
					{"Beinhaltet folgende Skills (Kinder):"}
				</span>
			</label>
			<div>
				{childItems.map((child, index) => (
					<InlineRemoveButton
						key={index}
						label={child.name}
						onRemove={() => removeChild(child.id)}
						onClick={() => handleSelection({ ...child, children: [], parents: [] })} // TODO feature: unfold children when clicked
					/>
				))}
				<PlusCircleIcon
					className="icon mt-2 h-5 cursor-pointer px-4 text-lg hover:text-secondary"
					onClick={() => {}}
				/>
			</div>
			<label>
				<span className="text-sm font-semibold">
					{"Ist Teil von folgenden Skills (Eltern):"}
				</span>
			</label>
			<div>
				{parentItems.map((child, index) => (
					<InlineRemoveButton
						key={index}
						label={child.name}
						onRemove={() => removeParent(child.id)}
						onClick={() => handleSelection({ ...child, children: [], parents: [] })}
					/>
				))}
				<PlusCircleIcon
					className="icon mt-2 h-5 cursor-pointer px-4 text-lg hover:text-secondary"
					onClick={() => {
						console.log("added");
					}}
				/>
			</div>
		</>
	);
}

function InlineRemoveButton({
	label,
	onRemove,
	onClick
}: {
	label: string;
	onRemove: () => void;
	onClick: () => void;
}) {
	return (
		<div className="inline-block">
			<div className="flex items-center rounded-lg border border-light-border bg-white text-sm">
				<button
					className="flex flex-grow cursor-pointer flex-col px-4 hover:text-secondary"
					onClick={onClick}
					type="button"
				>
					{label}
				</button>
				<button
					type="button"
					data-testid="remove"
					className="mr-2 rounded-full p-2 hover:bg-gray-50 hover:text-red-500"
					onClick={onRemove}
				>
					<XIcon className="h-3" />
				</button>
			</div>
		</div>
	);
}
