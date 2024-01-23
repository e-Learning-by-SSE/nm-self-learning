import { LabeledField } from "@self-learning/ui/forms";
import { Fragment, useState } from "react";
import { SkillSelectDialog } from "libs/feature/teaching/src/lib/course/course-learnpath-editor/skill-select-dialog";
import ReactFlow, { Background, Controls, Edge, MiniMap, Node, Position } from "reactflow";
import "reactflow/dist/style.css";
import { Tab, Table, TableDataColumn, Tabs } from "@self-learning/ui/common";
import { PencilIcon, TrashIcon } from "@heroicons/react/solid"; // TODO which version is it?

// ---------- GraphGenerator ------------------------------------------
// TODO: put graph generator into separate file
// TODO: remove later (dummy data)
const initMeshes = [
	{
		requiredSkill: null,
		lesson: "Python 1",
		gainedSkill: "Basic Python"
	},
	{
		requiredSkill: "Basic Python",
		lesson: "Python 2",
		gainedSkill: "Advanced Python"
	},
	{
		requiredSkill: "Advanced Python",
		lesson: "Python 3",
		gainedSkill: "skill"
	}
];

// standard starting position of node and standard distance between node
const xAxisStartPosition = 40;
const yAxisStartPosition = 40;
const xAxisNodeDistance = 260;
const yAxisNodeDistance = 200;

function isInArray(edge: Edge, arr: Edge[]) {
	for (const elem of arr) {
		if (edge.label === elem.label) {
			if (edge.source === elem.source && edge.target === elem.target) {
				return true;
			}
		}
	}
	return false;
}

function removeDuplicates(arr: Edge[]) {
	const resultArr: Edge[] = [];
	for (const elem of arr) {
		if (!isInArray(elem, resultArr)) {
			resultArr.push(elem);
		}
	}
	return resultArr;
}

function setEdgeIds(arr: Edge[]) {
	const resultArr: Edge[] = [];
	let id = 1;
	for (const edge of arr) {
		edge.id = String(id);
		resultArr.push(edge);
		id++;
	}
	return resultArr;
}

function getEdgesWithLabel(edges: Edge[], label: string) {
	const result: Edge[] = [];
	for (const edge of edges) {
		if (edge.label === label) {
			result.push(edge);
		}
	}
	return result;
}

function generateGraph(meshes: any) {
	const nodes: Node[] = [];
	const edges: Edge[] = [];
	let id = 1;
	let x = xAxisStartPosition;
	const y = yAxisStartPosition;

	for (const mesh of meshes) {
		const node: Node = {
			id: String(id),
			position: { x: x, y: y },
			data: { label: mesh.lesson },
			targetPosition: Position.Left,
			sourcePosition: Position.Right
		};
		nodes.push(node);

		if (mesh.gainedSkill) {
			const edge: Edge = {
				id: "",
				source: String(id),
				target: "",
				label: mesh.gainedSkill
			};
			edges.push(edge);
		}

		id++;
		x += xAxisNodeDistance;
	}

	id = 1;
	for (const mesh of meshes) {
		if (mesh.requiredSkill) {
			const edgesRequiringSkill = getEdgesWithLabel(edges, mesh.requiredSkill);
			for (const edge of edgesRequiringSkill) {
				if (edge) {
					const newEdge = structuredClone(edge);
					newEdge.target = String(id);
					edges.push(newEdge);
				}
			}
		}
		id++;
	}
	const edgesWithoutDuplicates = removeDuplicates(edges);
	const edgesWithIds = setEdgeIds(edgesWithoutDuplicates);
	// TODO adjusting the position of the nodes
	return { nodes: nodes, edges: edgesWithIds };
}

// ------------------------------------------------------------------

const initGraph = generateGraph(initMeshes); // TODO later with data from DB or empty

export default function LearnPathEditor() {
	const [skillsLessonMeshes, setSkillsLessonMeshes] = useState(initMeshes);
	const [graph, setGraph] = useState(initGraph);

	const handleSkillLessonLinkerClick = (mesh: any) => {
		// update meshes
		const updatedSkillLessonMeshes = skillsLessonMeshes;
		updatedSkillLessonMeshes.push(mesh);
		setSkillsLessonMeshes(updatedSkillLessonMeshes);
		// update graph
		const newGraph = generateGraph(skillsLessonMeshes);
		setGraph(newGraph);
	};

	const removeMesh = (indexToRemove: number) => {
		// update meshes
		const updatedSkillLessonMeshes = skillsLessonMeshes.filter(
			(_, index) => index !== indexToRemove
		);
		setSkillsLessonMeshes(updatedSkillLessonMeshes);
		// update graph
		const newGraph = generateGraph(updatedSkillLessonMeshes);
		setGraph(newGraph);
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
							onSkillLessonLinkerClick={handleSkillLessonLinkerClick}
						/>
					</div>
				</div>

				<div className="my-1 flex flex-col">
					<h1 className="px-2 text-2xl">Abhängigkeitsvisualisierung</h1>
					<div className="border bg-white px-2">
						<Flow nodes={graph.nodes} edges={graph.edges} size={530} />
					</div>
				</div>

				<div className="bottom-0 left-1/3 mx-auto min-h-[200px] flex-col">
					<div className="min-h-full max-w-[900px]">
						<LearnpathEditorLogs
							data={skillsLessonMeshes}
							onRemoveMeshClick={removeMesh}
						/>
					</div>
				</div>
			</div>
		</>
	);
}

function Flow({ nodes, edges, size }: { nodes: Node[]; edges: Edge[]; size: number }) {
	return (
		<div style={{ height: size }}>
			<ReactFlow nodes={nodes} edges={edges}>
				<Background />
				<Controls />
				<MiniMap />
			</ReactFlow>
		</div>
	);
}

function LearnpathEditorLogs({
	onRemoveMeshClick,
	data
}: {
	onRemoveMeshClick: (index: number) => void;
	data: any;
}) {
	const remove = (index: number) => {
		onRemoveMeshClick(index);
	};
	const index = 0;
	const [selectedIndex, setSelectedIndex] = useState(index);

	const value = ["Lerneinheiten", "Verlauf"];

	function handleChange(index: number) {
		setSelectedIndex(index);
	}
	return (
		<>
			<Tabs selectedIndex={selectedIndex} onChange={handleChange}>
				{value.map((val, idx) => (
					<Tab key={idx}>
						<p className="px-2 text-2xl">{val}</p>
					</Tab>
				))}
			</Tabs>

			{selectedIndex === 0 && (
				<Table head={<></>}>
					{data.map(
						(
							mesh: { requiredSkill: string; lesson: string; gainedSkill: string },
							index: number
						) => (
							<Fragment key={index}>
								<tr key={index}>
									<TableDataColumn>{index + 1}</TableDataColumn>
									<TableDataColumn>
										<div className="flex flex-wrap gap-4">{mesh.lesson}</div>
									</TableDataColumn>
									<TableDataColumn>
										<button
											type="button"
											className="btn-stroked w-fit self-end"
										>
											<PencilIcon className="icon" />
											<span>Bearbeiten</span>
										</button>
									</TableDataColumn>
									<TableDataColumn>
										<button
											className="ml-3 border bg-gray-50 px-1 text-sm"
											onClick={() => remove(index)}
										>
											<div className="ml-4">
												<TrashIcon className="icon " />
											</div>
										</button>
									</TableDataColumn>
								</tr>
							</Fragment>
						)
					)}
				</Table>
			)}
			{selectedIndex === 1 && (
				<div className="mt-1 min-h-[300px] min-w-[500px] border bg-white px-2">TODO ?</div>
			)}
		</>
	);
}

function SkillLessonLinker({ onSkillLessonLinkerClick = (mesh: any) => {} }) {
	const [openSkillSelectDialog, setOpenSkillSelectDialog] = useState(false);
	const [requiredSkill, setRequiredSkill] = useState("skill");
	const [gainedSkill, setGainedSkill] = useState("skill");
	const [lessonTitle, setLessonTitle] = useState("lesson");

	function handleClick() {
		const mesh = {
			requiredSkill: requiredSkill,
			lesson: lessonTitle,
			gainedSkill: gainedSkill
		};
		onSkillLessonLinkerClick(mesh);
	}

	function handleSkillSelectDialogClose(result?: any) {
		if (result) {
			if (result.currentRequiredSkill) {
				setRequiredSkill(result.currentRequiredSkill);
			}
			if (result.currentGainedSkill) {
				setGainedSkill(result.currentGainedSkill);
			}
		}
		setOpenSkillSelectDialog(false);
	}

	return (
		<>
			<div className="grid max-w-[1000px] flex-col space-x-1 border bg-white xl:grid-cols-[300px_300px_300px] ">
				<div className="mx-2 mt-2">
					<h1 className="text-1xl">Voraussetzung</h1>
					<div className="m-1 flex ">
						<p className="textfield  mx-1 min-w-[200px] border">{requiredSkill}</p>
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

				<form>
					<div className="m-2 pr-6">
						<h1 className="text-1xl">Lerneinheit</h1>
						<div className="">
							<LabeledField label="">
								<input
									type="text"
									className="textfield"
									value={lessonTitle}
									onChange={e => setLessonTitle(e.target.value)}
									placeholder={"Name"}
								/>
							</LabeledField>
						</div>
					</div>
				</form>

				<div className="m-2">
					<h1 className="text-1xl ">Lernziel</h1>
					<div className="m-1 flex ">
						<p className="textfield  mx-1 min-w-[200px] border">{gainedSkill}</p>
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
				<button type="button" className="btn-primary mt-2 min-w-full" onClick={handleClick}>
					Bestätigen
				</button>
			</div>
		</>
	);
}
