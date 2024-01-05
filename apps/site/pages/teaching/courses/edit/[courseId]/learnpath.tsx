import {
	DropdownDialog,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { LabeledField, SearchField } from "@self-learning/ui/forms";
import { trpc } from "@self-learning/api-client";
import { SkillTable } from "libs/feature/teaching/src/lib/skills/folder-editor/folder-list-view";
import {
	Fragment,
	JSXElementConstructor,
	Key,
	ReactElement,
	ReactFragment,
	ReactPortal,
	useState
} from "react";
import { useRouter } from "next/router";
import { Combobox } from "@headlessui/react";
import { ChapterDialog } from "libs/feature/teaching/src/lib/course/course-content-editor/dialogs/chapter-dialog";
import { SkillSelectDialog } from "libs/feature/teaching/src/lib/course/course-learnpath-editor/skill-select-dialog";
import { string } from "zod";

export default function LearnPathEditor() {
	const initMeshes = [
		{
			requiredSkill: "Objektorientierung",
			lesson: "Python Programming 1",
			gainedSkill: "Basic Python"
		},
		{
			requiredSkill: "Basic Python",
			lesson: "Python Programming 2",
			gainedSkill: "Advanced Python"
		},
		{
			requiredSkill: null,
			lesson: "Korean Cooking",
			gainedSkill: "Skill 1"
		}
	];

	const [skillsLessonMeshes, setSkillsLessonMeshes] = useState(initMeshes);

	const handleSkillLessonLinkerClick = (mesh: any) => {
		setSkillsLessonMeshes([...skillsLessonMeshes, mesh]);
	};

	const removeMesh = (indexToRemove: number) => {
		const tempArray = skillsLessonMeshes.filter((_, index) => index !== indexToRemove);
		setSkillsLessonMeshes(tempArray);
	};

	return (
		<>
			<div className=" bg-gray-50  p-4">
				<h1 className="text-3xl">Learnpath Editor</h1>
			</div>
			<div className="grid grid-rows-3 bg-gray-50 xl:grid-rows-[300px_300px_300px]">
				<div className="mx-auto mb-1 flex-col p-4">
					<h1 className="px-4 text-2xl">Lerneinheiten verknüpfen</h1>
					<SkillLessonLinker onSkillLessonLinkerClick={handleSkillLessonLinkerClick} />
				</div>

				<div className="mb-4 flex flex-col border  border-gray-200  bg-white px-4 py-4">
					<h1 className="flex-item md:w-1/100 w-full text-2xl">
						Abhängigkeitsvisualisierung
					</h1>
					<Learnpath data={skillsLessonMeshes} />
				</div>

				<div className="mx-auto  mb-4  ml-4 mr-4 max-w-[1000px] flex-col border border-gray-200  bg-white  px-4 py-4 pb-8">
					<h1 className="text-2xl">Lerneinheiten</h1>
					<LearnpathEditorLogs data={skillsLessonMeshes} onRemoveMeshClick={removeMesh} />
				</div>
			</div>
		</>
	);
}

function Learnpath(data: any) {
	return (
		<div>
			<div>
				{data.data.map(
					(
						mesh: { requiredSkill: string; lesson: string; gainedSkill: string },
						index: number
					) => (
						<div key={index}>
							({mesh.requiredSkill}) -- {mesh.lesson} -- ({mesh.gainedSkill})
						</div>
					)
				)}
			</div>
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
	const handleClick = (index: number) => {
		onRemoveMeshClick(index);
	};

	return (
		<div>
			{data.map(
				(
					mesh: { requiredSkill: string; lesson: string; gainedSkill: string },
					index: number
				) => (
					<div key={index}>
						{index + 1} | {mesh.lesson}
						<button
							className="ml-3 border bg-gray-50 px-1 text-sm"
							onClick={() => handleClick(index)}
						>
							x
						</button>
					</div>
				)
			)}
		</div>
	);
}

function SkillLessonLinker({ onSkillLessonLinkerClick = (mesh: any) => {} }) {
	const [openSkillSelectDialog, setOpenSkillSelectDialog] = useState(false);
	// mesh values
	const [requiredSkill, setRequiredSkill] = useState("default required skill");
	const [gainedSkill, setGainedSkill] = useState("default gained skill");
	const [lessonTitle, setLessonTitle] = useState("default lesson");

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
		<div className=" mx-4 grid max-w-[1000px] flex-col space-x-1 border bg-white p-4 xl:grid-cols-[300px_300px_300px]">
			<div className="mx-2">
				<h1 className="text-1xl">Voraussetzung</h1>
				<div className="textfield m-1 min-w-[230px] border">
					<div>{requiredSkill}</div>
				</div>

				<button
					type="button"
					className="m-1 min-w-[230px] rounded-lg border border-gray-200 bg-white py-2 px-5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:z-10 focus:outline-none  dark:border-gray-600 dark:bg-gray-800 dark:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-white"
					onClick={() => setOpenSkillSelectDialog(true)}
				>
					<span>Skill auswählen</span>
				</button>

				{openSkillSelectDialog && (
					<SkillSelectDialog onClose={handleSkillSelectDialogClose} />
				)}
			</div>

			<form>
				<div className="mx-4 pr-6">
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

			<div className="mx-4">
				<div>
					<h1 className="text-1xl">Lernziel</h1>
					<div className="textfield m-1 max-w-[230px] border">{gainedSkill}</div>
				</div>

				<button
					type="button"
					className="m-1 min-w-[230px] rounded-lg border border-gray-200 bg-white py-2 px-5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:z-10 focus:outline-none  dark:border-gray-600 dark:bg-gray-800 dark:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-white"
					onClick={() => setOpenSkillSelectDialog(true)}
				>
					<span>Skill auswählen</span>
				</button>
			</div>
			<button type="button" className="btn-primary ml-4 mt-2 mb-6" onClick={handleClick}>
				Bestätigen
			</button>
		</div>
	);
}
