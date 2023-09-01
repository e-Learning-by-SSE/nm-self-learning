import { useEffect, memo, useState } from "react";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
	SkillFormModel,
	SkillRepositoryModel,
	skillFormSchema,
	skillRepositorySchema
} from "@self-learning/types";
import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { SkillResolved } from "@self-learning/api";

function SkillInfoForm({ skill }: { skill: SkillFormModel | null }) {
	const { mutateAsync: updateSkill } = trpc.skill.updateSkill.useMutation();
	const [isNoSkillSelected, setNoSkillSelected] = useState(false);

	const onSubmit = (data: SkillFormModel) => {
		if (!skill) return;
		updateSkill({ skill: { ...data, repositoryId: skill.repositoryId, id: skill.id } });
	};

	const form = useForm({
		defaultValues: {
			id: skill?.id ?? "",
			repositoryId: skill?.repositoryId ?? "0",
			name: skill?.name ?? "",
			description: skill?.description || null,
			children: skill?.children ?? []
		},
		resolver: zodResolver(skillFormSchema)
	});

	const errors = form.formState.errors;

	useEffect(() => {
		setNoSkillSelected(!skill);
		if (!skill) return;
		form.setValue("name", skill?.name ?? "< Bitte einen Skill auswählen... > ");
		form.setValue("description", skill?.description ?? "");
	}, [skill, form, isNoSkillSelected]);

	return (
		<FormProvider {...form}>
			<form className="flex flex-col justify-between" onSubmit={form.handleSubmit(onSubmit)}>
				<Form.SidebarSection>
					<Form.SidebarSectionTitle
						title="Bearbeiten"
						subtitle="Informationen über den rechts ausgewählten Skill"
					/>
					<div className="flex flex-col gap-4">
						<LabeledField
							label="Name"
							error={errors.name?.message}
							disabled={isNoSkillSelected}
						>
							<input type="text" className="textfield" {...form.register("name")} />
						</LabeledField>
						<LabeledField
							label="Beschreibung"
							error={errors.description?.message}
							disabled={isNoSkillSelected}
						>
							<textarea {...form.register("description")} />
						</LabeledField>
						{skill ? (
							<DependencyInfoWithDbData skill={skill} />
						) : (
							<EmptyDependencyInfo />
						)}
						<div className="flex justify-between">
							<button type="submit" className="btn-primary w-full">
								Speichern
							</button>
						</div>
					</div>
				</Form.SidebarSection>
			</form>
		</FormProvider>
	);
}

function EmptyDependencyInfo() {
	return <SkillDependencyInfo isDisabled={true} children="" parents="" />;
}

function DependencyInfoWithDbData({ skill }: { skill: SkillFormModel }) {
	const [skillParents, setSkillParents] = useState<SkillResolved["parents"]>([]);
	const [skillChildren, setSkillChildren] = useState<SkillResolved["children"]>([]);

	const { data: dbSkill } = trpc.skill.getSkillById.useQuery({
		skillId: skill?.id
	});

	useEffect(() => {
		setSkillChildren(dbSkill?.children ?? []);
		setSkillParents(dbSkill?.parents ?? []);
	}, [dbSkill]);

	return (
		<SkillDependencyInfo
			isDisabled={true}
			children={skillChildren.map(child => child.name).join(", ")}
			parents={skillParents.map(parent => parent.name).join(", ")}
		/>
	);
}

function SkillDependencyInfo({
	isDisabled,
	children,
	parents
}: {
	isDisabled: boolean;
	children: string;
	parents: string;
}) {
	return (
		<>
			<LabeledField label="Beinhaltet folgende Skills (Kinder):" disabled={isDisabled}>
				<input type="text" className="textfield" readOnly value={children} />
			</LabeledField>
			<LabeledField label="Gehört zu folgenden Skills (Eltern):" disabled={true}>
				<input type="text" className="textfield" readOnly value={parents} />
			</LabeledField>
		</>
	);
}

function RepositoryInfoForm({ repository }: { repository: SkillRepositoryModel }) {
	const form = useForm({
		defaultValues: repository,
		resolver: zodResolver(skillRepositorySchema)
	});
	const errors = form.formState.errors;

	const { mutateAsync: changeRep } = trpc.skill.updateRepo.useMutation();

	const onSubmit = (data: SkillRepositoryModel) => {
		try {
			const da = changeRep({ rep: data, repoId: data.id ?? "0" });
			console.log(da);
			showToast({
				type: "success",
				title: "Skill Netzwerk gespeichert!",
				subtitle: ""
			});
		} catch (error) {
			if (error instanceof Error) {
				showToast({
					type: "error",
					title: "Aktuelles Skill Netzwerk konnte nicht gespeichert werden!",
					subtitle: error.message ?? ""
				});
			}
		}
	};

	return (
		<FormProvider {...form}>
			<form className="flex flex-col justify-between" onSubmit={form.handleSubmit(onSubmit)}>
				<Form.SidebarSection>
					<Form.SidebarSectionTitle
						title="Skill Netzwerk"
						subtitle="Informationen über das Skill Netzwerk "
					/>
					<div className="flex flex-col gap-4">
						<LabeledField label="Name" error={errors.name?.message}>
							<input type="text" className="textfield" {...form.register("name")} />
						</LabeledField>
						<LabeledField label="Beschreibung" error={errors.description?.message}>
							<input
								type="text"
								className="textfield"
								{...form.register("description")}
							/>
						</LabeledField>
						<div className="flex justify-between">
							<button type="submit" className="btn-primary w-full">
								Speichern
							</button>
						</div>
					</div>
				</Form.SidebarSection>
			</form>
		</FormProvider>
	);
}

export { SkillInfoForm };
export const RepositoryInfoMemorized = memo(RepositoryInfoForm);
