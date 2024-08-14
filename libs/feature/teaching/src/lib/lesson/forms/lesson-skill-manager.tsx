/* eslint-disable react/jsx-no-useless-fragment */
import { trpc } from "@self-learning/api-client";
import { SkillFormModel, SkillRepositoryModel } from "@self-learning/types";
import { Dialog, DialogActions, LoadingBox } from "@self-learning/ui/common";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { memo, useEffect, useState } from "react";
import { SelectSkillDialog } from "../../skills/skill-dialog/select-skill-dialog";
import { useFormContext } from "react-hook-form";
import { LessonFormModel } from "../lesson-form-model";
import { SelectSkillsView } from "../../skills/skill-dialog/select-skill-view";
import { ExtendedCourseFormModel } from "../../course/course-form-model";
import { IconButton } from "@self-learning/ui/common";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";

type SkillModalIdentifier = "teachingGoals" | "requirements";

/**
 * Area to add and remove skills to a lesson
 */
export function LessonSkillManager() {
	const { setValue, watch } = useFormContext<LessonFormModel>();

	const watchingSkills = {
		requires: watch("requires"),
		provides: watch("provides")
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
		skill = skill.map(skill => ({ ...skill, children: [], parents: [] }));
		setValue(id, [...watchingSkills[id], ...skill]);
	};

	const deleteSkill = (skill: SkillFormModel, id: SkillModalIdentifier) => {
		setValue(
			id,
			watchingSkills[id].filter(s => s.id !== skill.id)
		);
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
						skills={watchingSkills["provides"]}
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
						skills={watchingSkills["requires"]}
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

function LinkedSkillRepository({
	selectRepository,
	withRepoEditor
}: {
	selectRepository: (id: SkillRepositoryModel) => void;
	withRepoEditor?: boolean;
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

	const [openCreateDialog, setOpenCreateDialog] = useState(false);

	const onClose = () => {
		setOpenCreateDialog(false);
	};

	return (
		<>
			{isLoading ? (
				<LoadingBox />
			) : (
				<>
					{repositories && repositories.length > 0 && (
						<LabeledField label="Verlinkte Skill-Repositories">
							{withRepoEditor ? (
								<IconButton
									type="button"
									data-testid="author-add"
									onClick={() => setOpenCreateDialog(true)}
									title="Hinzufügen"
									text="Hinzufügen"
									icon={<PlusIcon className="h-5" />}
								/>
							) : null}
							<RepositoryDropDown repositories={repositories} onChange={onChange} />
						</LabeledField>
					)}
				</>
			)}
			{openCreateDialog && <NewSkillRepositoryDialog onClose={() => onClose()} />}
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

type CourseSkillModalIdentifier = "courseTeachingGoals" | "courseRequirements";

export function CourseSkillForm() {
	const { setValue, watch } = useFormContext<ExtendedCourseFormModel>();

	const watchingSkills = {
		courseRequirements: watch("courseRequirements"),
		courseTeachingGoals: watch("courseTeachingGoals")
	};

	const [selectedRepository, setSelectedRepository] = useState<SkillRepositoryModel | null>(null);
	const [selectSkillModal, setSelectSkillModal] = useState<{
		id: CourseSkillModalIdentifier;
	} | null>(null);

	const selectRepository = (id: SkillRepositoryModel) => {
		setSelectedRepository(id);
	};

	const addSkills = (skill: SkillFormModel[] | undefined, id: CourseSkillModalIdentifier) => {
		if (!skill) return;
		skill = skill.map(skill => ({ ...skill, children: [], parents: [] }));
		setValue(id, [...watchingSkills[id], ...skill]);
	};

	const deleteSkill = (skill: SkillFormModel, id: CourseSkillModalIdentifier) => {
		setValue(
			id,
			watchingSkills[id].filter(s => s.id !== skill.id)
		);
	};

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle
				title="Skills bearbeiten"
				subtitle="Ziele und Voraussetzungen dieses Kurses"
			/>
			<LinkedSkillRepositoryMemorized
				selectRepository={selectRepository}
				withRepoEditor={true}
			/>
			{selectedRepository && (
				<>
					<LabeledField label="Vermittelte Skills">
						<SelectSkillsView
							skills={watchingSkills["courseTeachingGoals"]}
							onDeleteSkill={skill => {
								deleteSkill(skill, "courseTeachingGoals");
							}}
							onAddSkill={skill => {
								addSkills(skill, "courseTeachingGoals");
							}}
							repoId={selectedRepository.id}
						/>
					</LabeledField>
					<LabeledField label="Benötigte Skills">
						<SelectSkillsView
							skills={watchingSkills["courseRequirements"]}
							onDeleteSkill={skill => {
								deleteSkill(skill, "courseRequirements");
							}}
							onAddSkill={skill => {
								addSkills(skill, "courseRequirements");
							}}
							repoId={selectedRepository.id}
						/>
					</LabeledField>

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

type SkillRepository = {
	name: string;
	description: string;
};

function NewSkillRepositoryDialog({ onClose }: { onClose: () => void }) {
	const { mutateAsync: createNewSkillRepo } = trpc.skill.addRepo.useMutation();
	const session = useSession();

	async function createNewRepository(formData: SkillRepository) {
		if (session.data?.user.id) {
			const userId = session.data?.user.id;
			const newRepo = { ...formData, ownerId: userId };
			const respose = await createNewSkillRepo({ rep: newRepo });
			console.log("New skill repository created", respose);
		} else {
			console.error("Creation of a new skill repository failed - no user logged in");
		}
		onClose();
	}
	return (
		<Dialog onClose={() => onClose()} title={"Neue Skill Repository"}>
			<NewSkillRepositoryForm handleSubmit={createNewRepository} />
			<DialogActions onClose={onClose}>
				<button className="btn-primary" type="submit" form="skill-repository-form">
					Erstellen
				</button>
			</DialogActions>
		</Dialog>
	);
}

function NewSkillRepositoryForm({
	handleSubmit
}: {
	handleSubmit: (formData: SkillRepository) => void;
}) {
	const [formData, setFormData] = useState({
		name: "",
		description: ""
	});

	function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		handleSubmit(formData);
	}

	return (
		<form onSubmit={onSubmit} id="skill-repository-form">
			<LabeledField label="Name" error={""}>
				<input
					value={formData.name}
					onChange={e => setFormData({ ...formData, name: e.target.value })}
				></input>
			</LabeledField>
			<LabeledField label="Beschreibung" error={""}>
				<input
					value={formData.description}
					onChange={e => setFormData({ ...formData, description: e.target.value })}
				></input>
			</LabeledField>
		</form>
	);
}
