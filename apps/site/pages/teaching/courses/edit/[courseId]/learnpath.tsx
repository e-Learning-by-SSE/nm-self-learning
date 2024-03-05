import { Fragment, useEffect, useState } from "react";
import { SkillSelectDialog } from "libs/feature/teaching/src/lib/course/course-learnpath-editor/skill-select-dialog";
import "reactflow/dist/style.css";
import {
	IconButton,
	Tab,
	Table,
	TableDataColumn,
	TableHeaderColumn,
	Tabs
} from "@self-learning/ui/common";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/solid"; // TODO which version is it?
import {
	LessonSelector,
	LessonSummary
} from "libs/feature/teaching/src/lib/course/course-content-editor/dialogs/lesson-selector";
import GraphEditor, {
	convertToGraph,
	convertToLearnpath
} from "libs/ui/forms/src/lib/graph-editor";

// ---------- Globals ------------------------------------------------
export interface Mesh {
	requiredSkills: any[];
	lesson: LessonSummary;
	gainedSkills: any[];
}

const tabNames = ["Konfigurierte Lerneinheiten", "Verlauf"];

// ---------- Dummy Data ------------------------------------------
// TODO remove later
const l1: LessonSummary = { title: "Lesson 1", lessonId: "", slug: "" };
const l2a: LessonSummary = { title: "Lesson 2a", lessonId: "", slug: "" };
const l2b: LessonSummary = { title: "Lesson 2b", lessonId: "", slug: "" };
const l3a: LessonSummary = { title: "Lesson 3a", lessonId: "", slug: "" };
const l3b: LessonSummary = { title: "Lesson 3b", lessonId: "", slug: "" };
const l4: LessonSummary = { title: "Lesson 4", lessonId: "", slug: "" };
const l5: LessonSummary = { title: "Lesson 5", lessonId: "", slug: "" };

const dummy_meshes: Mesh[] = [
	{
		requiredSkills: [],
		lesson: l1,
		gainedSkills: ["skill-1"]
	},
	{
		requiredSkills: ["skill-1"],
		lesson: l2a,
		gainedSkills: []
	},
	{
		requiredSkills: ["skill-1"],
		lesson: l2b,
		gainedSkills: ["skill-2"]
	},
	{
		requiredSkills: ["skill-2"],
		lesson: l3a,
		gainedSkills: ["skill-3"]
	},
	{
		requiredSkills: ["skill-2"],
		lesson: l3b,
		gainedSkills: ["skill-3"]
	},
	{
		requiredSkills: ["skill-3"],
		lesson: l4,
		gainedSkills: ["skill-4"]
	},
	{
		requiredSkills: ["skill-4"],
		lesson: l5,
		gainedSkills: ["skill-5"]
	}
];

const dummy_learnpath: Mesh[] = [
	{
		requiredSkills: [],
		lesson: l1,
		gainedSkills: ["skill-1"]
	},
	{
		requiredSkills: ["skill-1"],
		lesson: l2b,
		gainedSkills: ["skill-2"]
	},
	{
		requiredSkills: ["skill-2"],
		lesson: l3a,
		gainedSkills: ["skill-3"]
	},
	{
		requiredSkills: ["skill-4"],
		lesson: l5,
		gainedSkills: ["skill-5"]
	}
];

// ---------- Functions ---------------------------------------------------------------

function isLessonInMeshes(mesh: Mesh, meshes: Mesh[]) {
	const temp = meshes.filter(elemt => elemt.lesson.title === mesh.lesson.title);
	if (temp.length > 0) {
		return true;
	} else {
		return false;
	}
}

// ---------- Components ---------------------------------------------------------------

export default function LearnpathEditor() {
	const [meshes, setMeshes] = useState(dummy_meshes);
	const [currentMesh, setCurrentMesh] = useState(dummy_meshes[2]);
	const [graph, setGraph] = useState(convertToGraph(meshes));
	const [learnpath, setLearnpath] = useState(convertToLearnpath(dummy_learnpath));

	const addMesh = (mesh: Mesh) => {
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
	};

	useEffect(() => {
		const updatedGraph = convertToGraph(meshes);
		setGraph(updatedGraph);
	}, [meshes]);

	const removeMesh = (meshToRemove: Mesh) => {
		const updatedMeshes = meshes.filter(
			mesh => mesh.lesson.title !== meshToRemove.lesson.title
		);
		setMeshes(updatedMeshes);
	};

	const editMesh = (mesh: Mesh) => {
		setCurrentMesh(mesh);
	};

	// Learnpath Sidebar
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<>
			<div className=" bg-gray-50  p-4">
				<h1 className="text-3xl"></h1>
			</div>

			<div className="mt-2 grid grid-rows-3 bg-gray-50 xl:grid-rows-[200px_470px_600px]">
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
								<h1 className="m-2 mb-5 px-2 text-2xl">Lernpfad</h1>

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
		console.log("handle in SLL");
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
			<div className="grid max-w-[1100px] flex-col space-x-3 border bg-white p-2 xl:grid-cols-[320px_320px_320px] ">
				{/**
				<Selector
					title={"Voraussetzung"}
					btnText={"Hinzufügen"}
					isDialogOpen={openSkillSelectDialog}
					valueToDisplay={currentMesh.requiredSkills[0]}
					selectorType={<SkillSelectDialog onClose={handleSkillSelectDialogClose} />}
					handleDialogClose={handleSkillSelectDialogClose}
				/>
				*/}
				<div className="">
					<div className="flex justify-between">
						<h1 className="text-1xl">Voraussetzung</h1>
						<IconButton
							type="button"
							onClick={() => setOpenSkillSelectDialog(true)}
							title="Hinzufügen"
							text="Hinzufügen"
							icon={<PlusIcon className="h-4" />}
							className="btn-primary"
						/>
					</div>
					<div className="pt-2">
						<p className="textfield min-w-[200px] border">
							{currentMesh.requiredSkills[0]}
						</p>
					</div>
					{openSkillSelectDialog && (
						<SkillSelectDialog onClose={handleSkillSelectDialogClose} />
					)}
				</div>

				<div className="">
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
							{currentMesh.lesson.title}{" "}
						</p>
					</div>
				</div>
				{lessonSelectorOpen && (
					<LessonSelector open={lessonSelectorOpen} onClose={onCloseLessonSelector} />
				)}

				<div className="">
					<div className="flex justify-between">
						<h1 className="text-1xl">Lernziel</h1>
						<IconButton
							type="button"
							data-testid="author-add"
							onClick={() => setOpenSkillSelectDialog(true)}
							title="Hinzufügen"
							text="Hinzufügen"
							icon={<PlusIcon className="h-4" />}
							className="btn-primary"
						/>
					</div>
					<div className="pt-2">
						<p className="textfield min-w-[200px] border">
							{currentMesh.gainedSkills[0]}
						</p>
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
										{mesh.requiredSkills.map((skill: string, inx: number) => (
											<p key={inx}>{skill}</p>
										))}
									</div>
								</TableDataColumn>
								<TableDataColumn>
									<div className="flex flex-wrap gap-4">
										{mesh.gainedSkills.map((skill: string, inx: number) => (
											<p key={inx}>{skill}</p>
										))}
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

/* TODO: remove or integrate

function Selector({
	title,
	btnText,
	valueToDisplay,
	selectorType,
	isDialogOpen,
	handleDialogClose: handleSkillSelectDialogClose
}: {
	title: string;
	btnText: string;
	valueToDisplay: string;
	selectorType: ReactNode;
	isDialogOpen: boolean;
	handleDialogClose: (result: any) => void;
}) {
	const [openSelectDialog, setOpenSelectDialog] = useState(false);
	function handleCloseDialog(result: any) {
		setOpenSelectDialog(false);
		handleSkillSelectDialogClose(result);
	}

	function handleOnGetValue() {
		console.log("ojlasdkf");
	}

	return (
		<>
			<div className="">
				<div className="flex justify-between">
					<h1 className="text-1xl">{title}</h1>
					<IconButton
						type="button"
						onClick={() => (isDialogOpen = true)}
						title={btnText}
						text={btnText}
						icon={<PlusIcon className="h-4" />}
						className="btn-primary"
					/>
				</div>
				<div className="">
					<p className="textfield min-w-[200px] border">{valueToDisplay}</p>
				</div>
				{openSelectDialog && <SkillSelectDialog onClose={handleCloseDialog} />}
				{isDialogOpen && selectorType}
			</div>
		</>
	);
}

*/
