import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { SkillFormModel, skillFormSchema } from "@self-learning/types";
import { trpc } from "@self-learning/api-client";
import { SkillResolved } from "@self-learning/database";
import { SkillDeleteOption } from "./skill-taskbar";
import { IconOnlyButton, showToast } from "@self-learning/ui/common";
import { SelectSkillsView } from "../skill-dialog/select-skill-view";
import { SkillSelectHandler } from "./skill-display";
import { XMarkIcon } from "@heroicons/react/24/solid";

export function SelectedSkillsInfoForm({
	skills,
	onSkillSelect
}: {
	skills: SkillFormModel[];
	onSkillSelect: SkillSelectHandler;
}) {
	if (skills.length > 0) {
		return <SkillInfoForm skill={skills[0]} handleSelection={onSkillSelect} />;
	} else {
		return <> </>;
	}
}

export function SkillInfoForm({
	skill,
	handleSelection
}: {
	skill: SkillFormModel;
	handleSelection: SkillSelectHandler;
}) {
	const { t } = useTranslation(["feature-teaching", "common"]);
	const { mutateAsync: updateSkill } = trpc.skill.updateSkill.useMutation();
	const { data: dbSkill } = trpc.skill.getSkillById.useQuery({
		skillId: skill.id
	});

	const onSubmit = async (data: SkillFormModel) => {
		await updateSkill({
			skill: {
				...data,
				id: skill.id,
				// don't use the form values. parents|children are changed from inside the dependency info component
				children: skill.children,
				parents: skill.parents
			}
		});

		showToast({
			type: "success",
			title: t("Skills_Saved"),
			subtitle: ""
		});
	};

	const form = useForm({
		defaultValues: skill,
		resolver: zodResolver(skillFormSchema)
	});
	const errors = form.formState.errors;
	form.setValue("name", skill.name);
	form.setValue("description", skill?.description);
	const resetEditTarget = () => handleSelection(undefined);

	return (
		<FormProvider {...form}>
			<form className="flex flex-col justify-between" onSubmit={form.handleSubmit(onSubmit)}>
				<Form.SidebarSection>
					<div className="flex justify-between">
						<Form.SidebarSectionTitle
							title={t("common:edit")}
							subtitle={t("Skills_Edit_Subtitle")}
						/>

						<IconOnlyButton
							icon={<XMarkIcon className="h-5" />}
							onClick={resetEditTarget}
							title={t("Skills_Close_Without_Changes")}
							className="btn-tertiary px-4"
						/>
					</div>
					<div className="flex flex-col gap-4 border-b-2 border-c-border">
						<LabeledField label={t("common:Name")} error={errors.name?.message}>
							<input type="text" className="textfield" {...form.register("name")} />
						</LabeledField>
						<LabeledField
							label={t("common:Description")}
							error={errors.description?.message}
						>
							<textarea {...form.register("description")} />
						</LabeledField>
						<SkillToSkillDepsInfo
							parents={dbSkill?.parents ?? []}
							children={dbSkill?.children ?? []}
							skillToChange={skill}
						/>
					</div>
					<div className="flex justify-between gap-2">
						<button type="submit" className="btn-primary w-full">
							{t("common:save")}
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
	const { t } = useTranslation(["feature-teaching", "common"]);
	const [parentItems, setParentItems] = useState<SkillResolved["parents"]>(parents);
	const [childItems, setChildItems] = useState<SkillResolved["children"]>(children);
	const { setValue } = useFormContext<SkillFormModel>();

	useEffect(() => {
		setParentItems(parents);
	}, [parents]);

	useEffect(() => {
		setChildItems(children);
	}, [children]);

	const removeChild = (id: string) => {
		setChildItems(childItems.filter(item => item.id !== id));
		skillToChange.children = skillToChange.children.filter(item => item !== id);
	};

	const removeParent = (id: string) => {
		setParentItems(parentItems.filter(item => item.id !== id));
		skillToChange.parents = skillToChange.parents.filter(item => item !== id);
	};

	const addChildren = (skills: SkillFormModel[]) => {
		setChildItems([...childItems, ...skills]);
		skillToChange.children = [...skillToChange.children, ...skills.map(item => item.id)];
		setValue("children", skillToChange.children);
	};

	const addParent = (skills: SkillFormModel[]) => {
		setParentItems([...parentItems, ...skills]);
		skillToChange.parents = [...skillToChange.parents, ...skills.map(item => item.id)];
		setValue("parents", skillToChange.parents);
	};

	return (
		<>
			<label>
				<span className="text-sm font-semibold">{t("Skills_Children_Label")}</span>
			</label>
			<div>
				<SelectSkillsView
					skills={childItems.map(skill => {
						return {
							...skill,
							children: [],
							parents: []
						};
					})}
					onDeleteSkill={skill => {
						removeChild(skill.id);
					}}
					onAddSkill={skills => {
						if (!skills) return;
						addChildren(skills);
					}}
				/>
			</div>
			<label>
				<span className="text-sm font-semibold">{t("Skills_Parents_Label")}</span>
			</label>
			<div>
				<SelectSkillsView
					skills={parentItems.map(skill => {
						return {
							...skill,
							children: [],
							parents: []
						};
					})}
					disabled={
						skillToChange.children.length >= 1 && skillToChange.parents.length >= 0
					}
					onDeleteSkill={skill => {
						removeParent(skill.id);
					}}
					onAddSkill={skills => {
						if (!skills) return;
						if (
							skillToChange.children.length >= 1 &&
							skillToChange.parents.length >= 1
						) {
							return;
						}
						addParent(skills);
					}}
				/>
			</div>
		</>
	);
}
