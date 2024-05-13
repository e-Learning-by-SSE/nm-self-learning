import { Mesh, SkillFormModel } from "@self-learning/types";
import { SelectSkillDialog } from "../../skills/skill-dialog/select-skill-dialog";
import { IconButton } from "@self-learning/ui/common";
import { PlusIcon } from "@heroicons/react/24/solid";
import { LessonSelector, LessonSummary } from "../course-content-editor/dialogs/lesson-selector";
import { useState } from "react";

export function SkillLessonLinker({
	repositoryId,
	onClick: submitMesh,
	changeDisplayedMesh: changeCurrentMesh,
	displayedMesh: displayedMesh
}: {
	repositoryId: string;
	onClick: (mesh: Mesh) => void;
	changeDisplayedMesh: (mesh: Mesh) => void;
	displayedMesh: Mesh;
}) {
	const [requiredSkillSelectorOpen, setRequiredSkillSelectorOpen] = useState(false);
	const [gainedSkillSelectorOpen, setGainedSkillSelectorOpen] = useState(false);
	const [lessonSelectorOpen, setLessonSelectorOpen] = useState(false);

	function handleSubmit() {
		const mesh: Mesh = {
			requiredSkills: displayedMesh.requiredSkills,
			lesson: displayedMesh.lesson,
			gainedSkills: displayedMesh.gainedSkills
		};
		submitMesh(mesh);
	}

	function handleRequiredSkillSelectorClose(result?: SkillFormModel[]) {
		if (result) {
			const mesh: Mesh = {
				requiredSkills: displayedMesh.requiredSkills,
				lesson: displayedMesh.lesson,
				gainedSkills: displayedMesh.gainedSkills
			};
			mesh.requiredSkills = result;
			changeCurrentMesh(mesh);
		}
		setRequiredSkillSelectorOpen(false);
	}

	function handleGainedSkillSelectorClose(result?: SkillFormModel[]) {
		if (result) {
			const mesh: Mesh = {
				requiredSkills: displayedMesh.requiredSkills,
				lesson: displayedMesh.lesson,
				gainedSkills: displayedMesh.gainedSkills
			};
			mesh.gainedSkills = result;
			changeCurrentMesh(mesh);
		}
		setGainedSkillSelectorOpen(false);
	}

	function onCloseLessonSelector(lesson?: LessonSummary) {
		if (lesson && lesson.lessonId) {
			const mesh: Mesh = {
				requiredSkills: displayedMesh.requiredSkills,
				lesson: { lessonId: lesson.lessonId, title: lesson.title },
				gainedSkills: displayedMesh.gainedSkills
			};
			changeCurrentMesh(mesh);
		}
		setLessonSelectorOpen(false);
	}

	return (
		<>
			<div className="grid max-w-[1100px] flex-col space-x-3 border bg-white p-2 xl:grid-cols-[320px_320px_320px]">
				<div>
					<div className="flex justify-between">
						<h1 className="text-1xl">Voraussetzung</h1>
						<IconButton
							type="button"
							onClick={() => setRequiredSkillSelectorOpen(true)}
							title="Hinzufügen"
							text="Hinzufügen"
							icon={<PlusIcon className="h-4" />}
							className="btn-primary"
						/>
					</div>
					<div className="pt-2">
						<div className="textfield min-w-[200px] border">
							{displayedMesh.requiredSkills.map(
								(skill: SkillFormModel, inx: number) => (
									<p key={inx}>{skill.name}</p>
								)
							)}
						</div>
					</div>
					{requiredSkillSelectorOpen && (
						<SelectSkillDialog
							repositoryId={repositoryId}
							onClose={handleRequiredSkillSelectorClose}
						/>
					)}
				</div>

				<div>
					<div className="flex justify-between">
						<h1 className="text-1xl">Lerneinheit</h1>
						<button
							type="button"
							className="btn-primary max-h-10 "
							onClick={() => setLessonSelectorOpen(true)}
						>
							Auswählen
						</button>
					</div>
					<div className="pt-2">
						<p className="textfield min-w-[200px] border">
							{displayedMesh.lesson.title}
						</p>
					</div>
				</div>
				{lessonSelectorOpen && (
					<LessonSelector open={lessonSelectorOpen} onClose={onCloseLessonSelector} />
				)}

				<div>
					<div className="flex justify-between">
						<h1 className="text-1xl">Lernziel</h1>
						<IconButton
							type="button"
							onClick={() => setGainedSkillSelectorOpen(true)}
							title="Hinzufügen"
							text="Hinzufügen"
							icon={<PlusIcon className="h-4" />}
							className="btn-primary"
						/>
					</div>
					<div className="pt-2">
						<div className="textfield min-w-[200px] border">
							{displayedMesh.gainedSkills.map(
								(skill: SkillFormModel, inx: number) => (
									<p key={inx}>{skill.name}</p>
								)
							)}
						</div>
					</div>
				</div>
				{gainedSkillSelectorOpen && (
					<SelectSkillDialog
						repositoryId={repositoryId}
						onClose={handleGainedSkillSelectorClose}
					/>
				)}
			</div>
			<div className="flex justify-end">
				<button
					type="button"
					className="btn-primary mt-2 min-w-full"
					onClick={handleSubmit}
				>
					Bestätigen
				</button>
			</div>
		</>
	);
}
