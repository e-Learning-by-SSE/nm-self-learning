import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Mesh, SkillFormModel } from "@self-learning/types";
import { Tab, Table, TableDataColumn, TableHeaderColumn, Tabs } from "@self-learning/ui/common";
import { Fragment, useState } from "react";

const tabNames = ["Konfigurierte Lerneinheiten", "Verlauf"];

export function LearnpathEditorLogs({
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
