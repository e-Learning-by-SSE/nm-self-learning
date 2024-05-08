import { Fragment, useState } from "react";
import "reactflow/dist/style.css";
import {
	IconButton,
	Tab,
	Table,
	TableDataColumn,
	TableHeaderColumn,
	Tabs
} from "@self-learning/ui/common";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/solid";
import {
	LessonSelector,
	LessonSummary
} from "libs/feature/teaching/src/lib/course/course-content-editor/dialogs/lesson-selector";
import GraphEditor, { convertToGraph } from "libs/ui/forms/src/lib/graph-editor";
import { LearningUnit, Skill, getPath } from "@e-learning-by-sse/nm-skill-lib";
import { SelectSkillDialog } from "libs/feature/teaching/src/lib/skills/skill-dialog/select-skill-dialog";
import { Lesson, Mesh, SkillFormModel } from "@self-learning/types";
import { trpc } from "@self-learning/api-client";

// TODO: remove later
const repositoryId = "1";
const tabNames = ["Konfigurierte Lerneinheiten", "Verlauf"];

const controlStruc: SkillFormModel = {
	id: "1009",
	name: "Control Structures",
	repositoryId: "1",
	description: "if, switch case, loops",
	parents: [],
	children: ["1006", "1008"]
};
// ---------------------------------

function convertSkillFormModelToSkill(skills: SkillFormModel[]) {
	const result: Skill[] = Array.from(skills.values()).map(skill => ({
		...skill,
		nestedSkills: []
	}));
	return result;
}

function getSkills(repositoryId: string) {
	let result: Skill[] = [];
	const { data: skills } = trpc.skill.getSkillsFromRepository.useQuery({
		repoId: repositoryId
	});
	if (skills) {
		result = convertSkillFormModelToSkill(skills);
	}
	return result;
}

function convertMeshesToLearningUnits(meshes: Mesh[]) {
	const learningUnits: LearningUnit[] = Array.from(meshes.values()).map(mesh => ({
		id: mesh.lesson.lessonId as string,
		requiredSkills: convertSkillFormModelToSkill(mesh.requiredSkills),
		teachingGoals: convertSkillFormModelToSkill(mesh.gainedSkills),
		suggestedSkills: []
	}));
	return learningUnits;
}

function convertLearnpathToMeshes(learnpath: any[], meshes: Mesh[]) {
	const lessonIds = learnpath.map(lesson => lesson.id);
	return meshes.filter(mesh => lessonIds.includes(mesh.lesson.lessonId));
}

function generateLearnpathFromMeshes(
	teachingGoals: SkillFormModel[],
	repositoryId: string,
	meshes: Mesh[]
) {
	let result: any[] = [];

	const skills = getSkills(repositoryId);
	const goals: Skill[] = convertSkillFormModelToSkill(teachingGoals);
	const learningUnits: LearningUnit[] = convertMeshesToLearningUnits(meshes);

	const learnpath = getPath({ skills, goal: goals, learningUnits });

	if (learnpath) {
		result = convertLearnpathToMeshes(learnpath.path, meshes);
	}
	return convertToGraph(result, true);
}

function isLessonInMeshes(mesh: Mesh, meshes: Mesh[]) {
	const temp = meshes.filter(elemt => elemt.lesson.title === mesh.lesson.title);
	if (temp.length > 0) {
		return true;
	} else {
		return false;
	}
}

function convertToMeshSkills(skills: any[]) {
	return skills.map(skill => ({
		name: skill.name,
		id: skill.id,
		description: skill.description,
		repositoryId: skill.repositoryId,
		children: [],
		parents: []
	}));
}

function createMeshes(id: string) {
	const meshes: Mesh[] = [];

	const { data: lessonPool } = trpc.lessonPool.getLessonPoolById.useQuery({ id: id });
	let lessonsId: string[] = [];
	if (lessonPool) {
		if (lessonPool.lessons) {
			lessonsId = lessonPool.lessons;
		}
	}

	const { data: lessons } = trpc.lesson.findManyWithSkills.useQuery();
	if (lessons) {
		const poolLessons = lessons.filter(lesson => lessonsId.includes(lesson.lessonId));
		for (const lesson of poolLessons) {
			const mesh: Mesh = {
				requiredSkills: convertToMeshSkills(lesson.requirements),
				lesson: {
					lessonId: lesson.lessonId,
					title: lesson.title
				},
				gainedSkills: convertToMeshSkills(lesson.teachingGoals)
			};
			meshes.push(mesh);
		}
	}

	return meshes;
}

export default function LearnpathEditor({
	repoId,
	teachingGoals,
	lessonPoolId
}: {
	repoId: string;
	teachingGoals: SkillFormModel[];
	lessonPoolId: string;
}) {
	teachingGoals = [controlStruc]; // TODO remove later
	lessonPoolId = "1"; // TODO remove later, Q: what if there is not object with this Id in table?

	const initMeshes: Mesh[] = createMeshes(lessonPoolId);
	const initMesh: Mesh = {
		requiredSkills: [],
		lesson: { title: "", lessonId: "" },
		gainedSkills: []
	};

	const [meshes, setMeshes] = useState(initMeshes);
	const [displayedMesh, setDisplayedMesh] = useState(initMesh);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const graph = convertToGraph(meshes, false);
	const learnpath = generateLearnpathFromMeshes(teachingGoals, repositoryId, meshes);

	const { mutateAsync: updateLessonsInPool } = trpc.lessonPool.updateLessons.useMutation();
	const { mutateAsync: updateLessonSkills } = trpc.lesson.updateSkills.useMutation();

	const addMesh = async (mesh: Mesh) => {
		const updatedMeshes = [...meshes];
		if (!isLessonInMeshes(mesh, meshes)) {
			updatedMeshes.push(mesh);
		} else {
			const meshToEdit = meshes.filter(elem => elem.lesson.title === mesh.lesson.title)[0];
			meshToEdit.requiredSkills = mesh.requiredSkills;
			meshToEdit.gainedSkills = mesh.gainedSkills;
			updatedMeshes.map(elem => elem.lesson.title === mesh.lesson.title || meshToEdit);
		}
		setMeshes(updatedMeshes);
		if (mesh.lesson.lessonId !== null) {
			try {
				const result = await updateLessonSkills({
					id: mesh.lesson.lessonId,
					requirements: mesh.requiredSkills,
					teachingGoals: mesh.gainedSkills
				});
				console.log("Updating lesson", result);
			} catch (error) {
				console.log("Error while updating lesson", error);
			}
		}
	};

	const getLessonIds = () => {
		const lessonsIds = meshes.map(mesh => mesh.lesson.lessonId);
		const lessonIds = lessonsIds.filter(elem => elem !== null);
		return lessonIds.map(elem => elem as string);
	};

	const updateLessonPool = async () => {
		const lessonIds: string[] = getLessonIds();
		try {
			const response = await updateLessonsInPool({
				id: lessonPoolId,
				lessons: lessonIds
			});
			console.log("Updating lesson pool successful", response);
		} catch (error) {
			console.log(error);
		}
	};

	// TODO
	const loadLessonPool = () => {
		setMeshes(initMeshes);
	};

	const removeMesh = (meshToRemove: Mesh) => {
		const updatedMeshes = meshes.filter(
			mesh => mesh.lesson.title !== meshToRemove.lesson.title
		);
		setMeshes(updatedMeshes);
	};

	const editMesh = (mesh: Mesh) => {
		setDisplayedMesh(mesh);
	};

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<>
			<div className=" bg-gray-50  p-4">
				<div className="textfield min-w-[200px] border">
					<div className="font-bold">Lernziele:</div>
					{teachingGoals &&
						teachingGoals.map((skill: SkillFormModel, inx: number) => (
							<p key={inx}>{skill.name}</p>
						))}
				</div>
				<div>
					<button
						type="button"
						className="btn-primary mt-2 max-h-10"
						onClick={() => updateLessonPool()}
					>
						Lerneinheit-Pool speichern
					</button>
				</div>
				<div>
					<button
						type="button"
						className="btn-primary mt-2 max-h-10"
						onClick={() => loadLessonPool()}
					>
						Lerneinheit-Pool laden
					</button>
				</div>
			</div>

			<div className="mt-2 grid grid-rows-3 bg-gray-50 xl:grid-rows-[200px_470px_600px]">
				<div className="mx-auto flex-col">
					<h1 className="text-2xl">Lerneinheiten verknüpfen</h1>
					<div className="">
						<SkillLessonLinker
							onClick={addMesh}
							changeDisplayedMesh={editMesh}
							displayedMesh={displayedMesh}
						/>
					</div>
				</div>

				<div className="my-1 flex flex-col">
					<div className="my-2 grid flex-col xl:grid-cols-[350px_300px]">
						<h1 className="px-2 text-2xl">Abhängigkeitsvisualisierung</h1>

						<button className="btn-stroked w-fit self-end" onClick={toggleSidebar}>
							Lernpfad anzeigen
						</button>
					</div>

					<div className="border bg-white px-2">
						<GraphEditor
							graph={graph}
							height={400}
							hasControls={true}
							hasMiniMap={true}
						/>
					</div>
				</div>

				<div className="bottom-0 left-1/3 mx-auto min-h-[200px] flex-col">
					<div className="min-h-full max-w-[1200px]">
						<LearnpathEditorLogs
							meshes={meshes}
							onRemoveMeshClick={removeMesh}
							onEditClick={editMesh}
						/>
					</div>
				</div>
			</div>
			<div className="flex h-screen">
				<div
					className={`border bg-white ${
						isSidebarOpen ? "translate-x-0" : "translate-x-60"
					} w-200 fixed inset-y-0 right-0 transform transition-all duration-300`}
				>
					<div className="min-w-[260px] flex-1">
						<div className="grid xl:grid-cols-[20px_200px]">
							<div className="flex h-screen w-20">
								<button
									type="button"
									className=" h-screen bg-gray-200 hover:bg-slate-300"
									onClick={toggleSidebar}
								>
									<div className="w-5 origin-bottom-left rotate-90 transform">
										Learnpfad
									</div>
								</button>
							</div>
							<div className="w-200 pl-4">
								<div className="my-10 py-10">
									<h1 className="text-2xl">Lernpfad</h1>
								</div>
								<GraphEditor
									graph={learnpath}
									height={900}
									hasControls={false}
									hasMiniMap={false}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

function SkillLessonLinker({
	onClick: submitMesh,
	changeDisplayedMesh: changeCurrentMesh,
	displayedMesh: displayedMesh
}: {
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

function LearnpathEditorLogs({
	onRemoveMeshClick: onRemoveMeshClick,
	onEditClick: onEditClick,
	meshes
}: {
	onRemoveMeshClick: (mesh: Mesh) => void;
	onEditClick: (mesh: Mesh) => void;
	meshes: Mesh[];
}) {
	const remove = (mesh: Mesh) => {
		onRemoveMeshClick(mesh);
	};

	const edit = (mesh: Mesh) => {
		onEditClick(mesh);
	};

	const [selectedIndex, setSelectedIndex] = useState(0);

	function handleChange(index: number) {
		setSelectedIndex(index);
	}

	return (
		<>
			<Tabs selectedIndex={selectedIndex} onChange={handleChange}>
				{tabNames.map((val, idx) => (
					<Tab key={idx}>
						<p className="px-2 text-2xl">{val}</p>
					</Tab>
				))}
			</Tabs>
			{selectedIndex === 0 && (
				<Table
					head={
						<>
							<TableHeaderColumn></TableHeaderColumn>
							<TableHeaderColumn>Lerneinheit</TableHeaderColumn>
							<TableHeaderColumn>Voraussetzung</TableHeaderColumn>
							<TableHeaderColumn>Lernziel</TableHeaderColumn>
							<TableHeaderColumn></TableHeaderColumn>
							<TableHeaderColumn></TableHeaderColumn>
							<TableHeaderColumn></TableHeaderColumn>
						</>
					}
				>
					{meshes.map((mesh: Mesh, index: number) => (
						<Fragment key={index}>
							<tr key={index}>
								<TableDataColumn>{index + 1}</TableDataColumn>
								<TableDataColumn>
									<div className="flex flex-wrap gap-4">{mesh.lesson.title}</div>
								</TableDataColumn>
								<TableDataColumn>
									<div className="flex flex-wrap gap-4">
										{mesh.requiredSkills.map(
											(skill: SkillFormModel, inx: number) => (
												<p key={inx}>{skill.name}</p>
											)
										)}
									</div>
								</TableDataColumn>
								<TableDataColumn>
									<div className="flex flex-wrap gap-4">
										{mesh.gainedSkills.map(
											(skill: SkillFormModel, inx: number) => (
												<p key={inx}>{skill.name}</p>
											)
										)}
									</div>
								</TableDataColumn>
								<TableDataColumn>
									<button
										type="button"
										className="btn-stroked w-fit self-end"
										onClick={() => edit(mesh)}
									>
										<PencilIcon className="icon" />
										<span>Verknüpfung anpassen</span>
									</button>
								</TableDataColumn>
								<TableDataColumn>
									<button type="button" className="btn-stroked w-fit self-end">
										<PencilIcon className="icon" />
										<span>Lerneinheit anpassen</span>
									</button>
								</TableDataColumn>
								<TableDataColumn>
									<button
										className="ml-3 border bg-gray-50 px-1 text-sm"
										onClick={() => remove(mesh)}
									>
										<div className="ml-4">
											<TrashIcon className="icon " />
										</div>
									</button>
								</TableDataColumn>
							</tr>
						</Fragment>
					))}
				</Table>
			)}
			{selectedIndex === 1 && (
				<div className="mt-1 min-h-[300px] min-w-[500px] border bg-white px-2">TODO</div>
			)}
		</>
	);
}
function key(value: string, index: number, array: string[]): void {
	throw new Error("Function not implemented.");
}
