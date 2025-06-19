/* eslint-disable react/jsx-no-useless-fragment */
import { trpc } from "@self-learning/api-client";
import { SkillFormModel, SkillRepositoryModel } from "@self-learning/types";
import { LoadingBox } from "@self-learning/ui/common";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { memo, useEffect, useState } from "react";
import { Path, PathValue, useFormContext } from "react-hook-form";
import { MarkdownListboxMenu } from "@self-learning/markdown";
import { LabeledFieldSelectSkillsView } from "./skill-dialog/select-skill-view";
import { SelectSkillDialog } from "./skill-dialog/select-skill-dialog";

/**
 * Area to add and remove skills to a lesson
 */
export function SkillManager<
	T extends {
		requires: SkillFormModel[];
		provides: SkillFormModel[];
	} & Record<string, unknown>
>() {
	type SkillModalIdentifier = keyof Pick<T, "requires" | "provides">;

	const { setValue, watch } = useFormContext<T>();

	const watchingSkills = {
		requires: watch("requires" as Path<T>),
		provides: watch("provides" as Path<T>)
	};

	const [selectedRepository, setSelectedRepository] = useState<SkillRepositoryModel | null>(null);
	const [selectSkillModal, setSelectSkillModal] = useState<{ id: SkillModalIdentifier } | null>(
		null
	);

	const selectRepository = (id: SkillRepositoryModel) => {
		setSelectedRepository(id);
	};

	const addSkills = (skill: SkillFormModel[] | undefined, id: SkillModalIdentifier) => {
		if (!skill) return;
		const enriched = skill.map(s => ({ ...s, children: [], parents: [] }));

		const currentSkills = watchingSkills[id] as SkillFormModel[];
		const combinedSkills = [...currentSkills, ...enriched];

		setValue(id as Path<T>, combinedSkills as PathValue<T, Path<T>>);
	};

	const deleteSkill = (skill: SkillFormModel, id: SkillModalIdentifier) => {
		const currentSkills = watchingSkills[id] as SkillFormModel[];
		const filteredSkills = currentSkills.filter(s => s.id !== skill.id);

		setValue(id as Path<T>, filteredSkills as PathValue<T, Path<T>>);
	};

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle
				title="Skills"
				subtitle="Vermittelte und Benötigte Skills dieser Lerneinheit"
			/>
			<LinkedSkillRepositoryMemorized selectRepository={selectRepository} />

			{selectedRepository && (
				<>
					<LabeledFieldSelectSkillsView
						label={"Vermittelte Skills"}
						skills={watchingSkills["provides"] as SkillFormModel[]}
						onDeleteSkill={skill => {
							deleteSkill(skill, "provides");
						}}
						onAddSkill={skill => {
							addSkills(skill, "provides");
						}}
						repoId={selectedRepository.id}
					/>

					<LabeledFieldSelectSkillsView
						label={"Benötigte Skills"}
						skills={watchingSkills["requires"] as SkillFormModel[]}
						onDeleteSkill={skill => {
							deleteSkill(skill, "requires");
						}}
						onAddSkill={skill => {
							addSkills(skill, "requires");
						}}
						repoId={selectedRepository.id}
					/>

					{selectSkillModal && (
						<SelectSkillDialog
							onClose={skill => {
								setSelectSkillModal(null);
								addSkills(skill, selectSkillModal.id);
							}}
							repositoryId={selectedRepository.id}
						/>
					)}
				</>
			)}
		</Form.SidebarSection>
	);
}

const LinkedSkillRepositoryMemorized = memo(LinkedSkillRepository);

export function LinkedSkillRepository({
	selectRepository
}: {
	selectRepository: (id: SkillRepositoryModel) => void;
}) {
	// TODO Make a method to get a smaller version of the repository
	const { data: repositories, isLoading } = trpc.skill.getRepositories.useQuery();

	if (isLoading) {
		return <div />;
	}

	const onChange = (name: string) => {
		const repository = repositories?.find(repository => repository.name === name);
		if (repository) {
			selectRepository(repository);
		}
	};

	return (
		<>
			{isLoading ? (
				<LoadingBox />
			) : (
				<>
					{repositories && repositories.length > 0 && (
						<LabeledField label={"Verlinkte Skill-Repositories"}>
							<RepositoryDropDown repositories={repositories} onChange={onChange} />
						</LabeledField>
					)}
				</>
			)}
		</>
	);
}

function RepositoryDropDown({
	repositories,
	onChange
}: {
	repositories: SkillRepositoryModel[];
	onChange: (name: string) => void;
}) {
	const [selectedRepository, setSelectedRepository] = useState<string>(repositories[0].name);

	const changeDisplaySelectedRepository = (name: string) => {
		setSelectedRepository(name);
	};

	useEffect(() => {
		onChange(selectedRepository);
	}, [onChange, selectedRepository]);

	return (
		<div className="flex w-full">
			<MarkdownListboxMenu
				title=""
				onChange={name => changeDisplaySelectedRepository(name)}
				displayValue={selectedRepository ?? repositories[0].name}
				options={repositories.map(repository => repository.name)}
			/>
		</div>
	);
}
