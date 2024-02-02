import { Fragment, useEffect, useState } from "react";
import { SkillSelectDialog } from "libs/feature/teaching/src/lib/course/course-learnpath-editor/skill-select-dialog";
import "reactflow/dist/style.css";
import { Tab, Table, TableDataColumn, TableHeaderColumn, Tabs } from "@self-learning/ui/common";
import { PencilIcon, TrashIcon } from "@heroicons/react/solid"; // TODO which version is it?
import {
	LessonSelector,
	LessonSummary
} from "libs/feature/teaching/src/lib/course/course-content-editor/dialogs/lesson-selector";
import GraphEditor from "./graphEditor";
import { convertToGraph } from "./graphEditor";

export interface Mesh {
	requiredSkills: any[];
	lesson: LessonSummary;
	gainedSkills: any[];
}

const tabNames = ["Konfigurierte Lerneinheiten", "Verlauf"];

// ---------- Dummy Data ------------------------------------------
// TODO remove later
const initLesson: LessonSummary = { title: "Dummy Lesson 1", lessonId: "", slug: "" };
const initLesson2: LessonSummary = { title: "Dummy Lesson 2", lessonId: "", slug: "" };
const initLesson3: LessonSummary = { title: "Dummy Lesson 3", lessonId: "", slug: "" };

const initMeshes: Mesh[] = [
	{
		requiredSkills: ["skill-0"],
		lesson: initLesson,
		gainedSkills: ["skill-1"]
	},
	{
		requiredSkills: ["skill-1"],
		lesson: initLesson2,
		gainedSkills: ["skill-2"]
	},
	{
		requiredSkills: ["skill-2"],
		lesson: initLesson3,
		gainedSkills: ["skill-3", "skill-3.1"]
	}
];

// test dummy data
const l1: LessonSummary = { title: "Lesson 1", lessonId: "", slug: "" };
const l2: LessonSummary = { title: "Lesson 2", lessonId: "", slug: "" };
const l3: LessonSummary = { title: "Lesson 3", lessonId: "", slug: "" };
const l4: LessonSummary = { title: "Lesson 4", lessonId: "", slug: "" };
const l5: LessonSummary = { title: "Lesson 5", lessonId: "", slug: "" };
const l6: LessonSummary = { title: "Lesson 6", lessonId: "", slug: "" };
const testMesh_1: Mesh[] = [
	{
		requiredSkills: [],
		lesson: l1,
		gainedSkills: ["skill-1.1", "skill-1.2"]
	},
	{
		requiredSkills: ["skill-1.1", "skill-1.2"],
		lesson: l2,
		gainedSkills: ["skill-2.1", "skill-2.2"]
	},
	{
		requiredSkills: ["skill-2.1"],
		lesson: l3,
		gainedSkills: []
	},
	{
		requiredSkills: ["skill-2.2"],
		lesson: l4,
		gainedSkills: []
	},
	{
		requiredSkills: [],
		lesson: l5,
		gainedSkills: ["skill-5"]
	},
	{
		requiredSkills: ["skill-5"],
		lesson: l6,
		gainedSkills: []
	}
];

// --------------------------------------------------------------------------------------------
const placeholderMesh: Mesh = {
	requiredSkills: ["placeholder-req-skill"],
	lesson: { title: "placeholder-lesson", lessonId: "", slug: "" },
	gainedSkills: ["placeholder-gain-skill"]
};

function isLessonInMeshes(mesh: Mesh, meshes: Mesh[]) {
	const temp = meshes.filter(elemt => elemt.lesson.title === mesh.lesson.title);
	if (temp.length > 0) {
		return true;
	} else {
		return false;
	}
}

export default function LearnpathEditor() {
	//const [skillsLessonMeshes, setSkillsLessonMeshes] = useState(initMeshes);
	const [skillsLessonMeshes, setSkillsLessonMeshes] = useState(testMesh_1);
	const [currentMesh, setCurrentMesh] = useState(placeholderMesh);
	const [graph, setGraph] = useState(convertToGraph(skillsLessonMeshes));

	const addMesh = (mesh: Mesh) => {
		const updatedSkillLessonMeshes = [...skillsLessonMeshes];
		if (!isLessonInMeshes(mesh, skillsLessonMeshes)) {
			updatedSkillLessonMeshes.push(mesh);
		} else {
			const meshToEdit = skillsLessonMeshes.filter(
				elem => elem.lesson.title === mesh.lesson.title
			)[0];
			meshToEdit.requiredSkills = mesh.requiredSkills;
			meshToEdit.gainedSkills = mesh.gainedSkills;
			updatedSkillLessonMeshes.map(
				elem => elem.lesson.title === mesh.lesson.title || meshToEdit
			);
		}
		setSkillsLessonMeshes(updatedSkillLessonMeshes);
	};

	useEffect(() => {
		const updatedGraph = convertToGraph(skillsLessonMeshes);
		setGraph(updatedGraph);
	}, [skillsLessonMeshes]);

	const removeMesh = (meshToRemove: Mesh) => {
		const updatedSkillLessonMeshes = skillsLessonMeshes.filter(
			mesh => mesh.lesson.title !== meshToRemove.lesson.title
		);
		setSkillsLessonMeshes(updatedSkillLessonMeshes);
	};

	const editMesh = (mesh: Mesh) => {
		setCurrentMesh(mesh);
	};

	return (
		<>
			<div className=" bg-gray-50  p-4">
				<h1 className="text-3xl"></h1>
			</div>
			<div className="mt-2 grid grid-rows-3 bg-gray-50 xl:grid-rows-[200px_600px_400px]">
				<div className="mx-auto flex-col">
					<h1 className="text-2xl">Lerneinheiten verknüpfen</h1>
					<div className="">
						<SkillLessonLinker
							onSkillLessonLinkerClick={addMesh}
							changeCurrentMesh={editMesh}
							currentMesh={currentMesh}
						/>
					</div>
				</div>

				<div className="my-1 flex flex-col">
					<h1 className="px-2 text-2xl">Abhängigkeitsvisualisierung</h1>
					<div className="border bg-white px-2">
						<GraphEditor meshes={skillsLessonMeshes} graph={graph} size={530} />
					</div>
				</div>

				<div className="bottom-0 left-1/3 mx-auto min-h-[200px] flex-col">
					<div className="min-h-full max-w-[1200px]">
						<LearnpathEditorLogs
							meshes={skillsLessonMeshes}
							//nodes={graph.nodes}
							onRemoveMeshClick={removeMesh}
							onEditClick={editMesh}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
// ----------------------------------------

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

	const index = 0;
	const [selectedIndex, setSelectedIndex] = useState(index);

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
										{mesh.requiredSkills}
									</div>
								</TableDataColumn>
								<TableDataColumn>
									<div className="flex flex-wrap gap-4">{mesh.gainedSkills}</div>
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

function SkillLessonLinker({
	onSkillLessonLinkerClick: onSkillLessonLinkerClick,
	changeCurrentMesh: changeCurrentMesh,
	currentMesh
}: {
	onSkillLessonLinkerClick: (mesh: Mesh) => void;
	changeCurrentMesh: (mesh: Mesh) => void;
	currentMesh: Mesh;
}) {
	const [openSkillSelectDialog, setOpenSkillSelectDialog] = useState(false);
	const [lessonSelectorOpen, setLessonSelectorOpen] = useState(false);

	function handleSubmit() {
		const mesh: Mesh = {
			requiredSkills: currentMesh.requiredSkills,
			lesson: currentMesh.lesson,
			gainedSkills: currentMesh.gainedSkills
		};
		onSkillLessonLinkerClick(mesh);
	}

	function handleSkillSelectDialogClose(result?: any) {
		// TODO: integrate skill selector
		// Which data format has result?
		// decomposed it and update required/gainedSkills arrays
		if (result) {
			const mesh: Mesh = {
				requiredSkills: currentMesh.requiredSkills,
				lesson: currentMesh.lesson,
				gainedSkills: currentMesh.gainedSkills
			};
			if (result.currentRequiredSkill) {
				const newSkillsArr: any[] = [result.currentRequiredSkill];
				mesh.requiredSkills = newSkillsArr;
			}
			if (result.currentGainedSkill) {
				const newSkillsArr: any[] = [result.currentGainedSkill];
				mesh.gainedSkills = newSkillsArr;
			}
			changeCurrentMesh(mesh);
		}
		setOpenSkillSelectDialog(false);
	}

	function onCloseLessonSelector(lesson?: LessonSummary) {
		setLessonSelectorOpen(false);

		if (lesson) {
			const mesh: Mesh = {
				requiredSkills: currentMesh.requiredSkills,
				lesson: lesson,
				gainedSkills: currentMesh.gainedSkills
			};
			changeCurrentMesh(mesh);
		}
	}

	return (
		<>
			<div className="grid max-w-[1000px] flex-col space-x-1 border bg-white xl:grid-cols-[300px_300px_300px] ">
				<div className="mx-2 mt-2">
					<h1 className="text-1xl">Voraussetzung</h1>
					<div className="m-1 flex ">
						<p className="textfield  mx-1 min-w-[200px] border">
							{currentMesh.requiredSkills[0]}
						</p>
						<button
							type="button"
							className="btn-primary max-h-10 max-w-[0.1px]"
							onClick={() => setOpenSkillSelectDialog(true)}
						>
							+
						</button>
					</div>
					{openSkillSelectDialog && (
						<SkillSelectDialog onClose={handleSkillSelectDialogClose} />
					)}
				</div>
				<div className="m-2 pr-6">
					<h1 className="text-1xl">Lerneinheit</h1>
					<div className="m-1 flex ">
						<p className="textfield  mx-1 min-w-[200px] border">
							{currentMesh.lesson.title}{" "}
						</p>
						<button
							type="button"
							className="btn-primary max-h-10 max-w-[0.1px]"
							onClick={() => setLessonSelectorOpen(true)}
						>
							+
						</button>
					</div>
				</div>
				{lessonSelectorOpen && (
					<LessonSelector open={lessonSelectorOpen} onClose={onCloseLessonSelector} />
				)}

				<div className="m-2">
					<h1 className="text-1xl ">Lernziel</h1>
					<div className="m-1 flex ">
						<p className="textfield  mx-1 min-w-[200px] border">
							{currentMesh.gainedSkills[0]}
						</p>{" "}
						<button
							type="button"
							className="btn-primary max-h-10 max-w-[0.1px]"
							onClick={() => setOpenSkillSelectDialog(true)}
						>
							+
						</button>
					</div>
				</div>
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
