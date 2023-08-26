import { useEffect, useMemo, memo } from "react";
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

function SkillInfoForm({ skill }: { skill: SkillFormModel | null }) {
	const getSkillOrDefault = useMemo(() => {
		return {
			id: skill?.id ?? "",
			repositoryId: skill?.repositoryId ?? "10",
			name: skill?.name ?? "",
			description: skill?.description || null,
			children: skill?.children ?? []
		};
	}, [skill]);

	const form = useForm({
		defaultValues: getSkillOrDefault,
		resolver: zodResolver(skillFormSchema)
	});

	const errors = form.formState.errors;

	useEffect(() => {
		const skill = getSkillOrDefault;
		form.setValue("name", skill.name);
		form.setValue("description", skill.description);
		form.setValue("children", skill.children);
	}, [form, getSkillOrDefault]);

	const { mutateAsync: updateSkill } = trpc.skill.updateSkill.useMutation();
	const onSubmit = (data: SkillFormModel) => {
		// TODO: fix this
		// we missing repositoryId and id in the data object
		// naive solution:
		//     if (!skill) return;
		//     updateSkill({ skill: { ...data, repositoryId: skill.repositoryId, id: skill.id } });
		// better solution would be to have the repositoryId and id in the data
		updateSkill({ skill: data });
	};

	return (
		<FormProvider {...form}>
			<form className="flex flex-col justify-between" onSubmit={form.handleSubmit(onSubmit)}>
				<Form.SidebarSection>
					<Form.SidebarSectionTitle
						title="Skill - Daten"
						subtitle="Informationen über den rechts ausgewählten Skill"
					/>
					<div className="flex flex-col gap-4">
						<LabeledField label="Name" error={errors.name?.message}>
							<input type="text" className="textfield" {...form.register("name")} />
						</LabeledField>
						<LabeledField label="Beschreibung" error={errors.description?.message}>
							<textarea {...form.register("description")} />
						</LabeledField>
						<LabeledField label="Abhängig von:">
							<input
								type="text"
								className="textfield"
								readOnly
								value={form.getValues("children")}
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
