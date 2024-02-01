import { TableDataColumn } from "@self-learning/ui/common";
import React from "react";
import { ChevronDownIcon, ChevronRightIcon, FolderIcon, RefreshIcon } from "@heroicons/react/solid";
import { PencilIcon, PuzzleIcon } from "@heroicons/react/outline";
import { AddChildButton, SkillDeleteOption } from "./skill-taskbar";
import styles from "./folder-table.module.css";
import { SkillFolderVisualization, SkillSelectHandler, UpdateVisuals } from "./skill-display";
import { isTruthy } from "@self-learning/util/common";

export function ListSkillEntryWithChildren({
	skillResolver,
	skillDisplayData,
	depth,
	handleSelection,
	updateSkillDisplay
}: {
	skillResolver: (skillId: string) => SkillFolderVisualization | undefined;
	skillDisplayData: SkillFolderVisualization;
	depth: number;
	handleSelection: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
}) {
	const showChildren = skillDisplayData.isExpanded ?? false;

	return (
		<>
			<SkillRow
				key={`${skillDisplayData.id}-${depth}`}
				skill={skillDisplayData}
				depth={depth}
				handleSelection={handleSelection}
				updateSkillDisplay={updateSkillDisplay}
			/>
			{showChildren &&
				skillDisplayData.skill.children
					.map(childId => skillResolver(childId))
					.filter(isTruthy)
					.map(element => (
						// recursive structure to add <SkillRow /> for each child
						<ListSkillEntryWithChildren
							key={`${element.id}-${depth + 1}`}
							skillDisplayData={element}
							updateSkillDisplay={updateSkillDisplay}
							skillResolver={skillResolver}
							handleSelection={handleSelection}
							depth={depth + 1}
						/>
					))}
		</>
	);
}

function SkillRow({
	skill,
	depth,
	handleSelection,
	updateSkillDisplay
}: {
	skill: SkillFolderVisualization;
	depth: number;
	handleSelection: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
}) {
	const depthCssStyle = {
		"--depth": depth
	} as React.CSSProperties;
	const onOpen = () => {
		// disables highlight effect after user interacted with the element
		const childrenDisplays = skill.skill.children.map(cid => ({
			id: cid,
			shortHighlight: false
		}));
		updateSkillDisplay([
			...childrenDisplays,
			{ id: skill.id, isExpanded: !skill.isExpanded, shortHighlight: false }
		]);
	};

	return (
		<tr
			style={depthCssStyle}
			title={`${
				skill.cycleType === "child"
					? "Dieser Skill ist Teil eines Zyklus."
					: skill.cycleType === "parent"
					? "Dieser Ordner enthält einen Zyklus, ist aber kein Teil davon."
					: ""
			}`}
			className={`group cursor-pointer hover:bg-gray-100 ${
				skill.cycleType !== "none" && skill.isSelected ? "bg-red-100" : ""
			}
				${
					skill.cycleType === "parent" &&
					/* !displayInfo.hasCycle TODO */ !skill.isSelected
						? "bg-yellow-100"
						: ""
				}
				${skill.isSelected ? "bg-gray-200" : ""} `}
		>
			<TableDataColumn className={"text-center align-middle"}>
				<input
					className="secondary form-checkbox rounded text-secondary focus:ring-secondary"
					type="checkbox"
					defaultChecked={false} // TODO mass select
				/>
			</TableDataColumn>

			<TableDataColumn
				className={`${styles["folder-line"]} ${
					skill.shortHighlight ? "animate-highlight rounded-md" : ""
				} text-sm font-medium`}
			>
				<div className={`flex px-2`}>
					<div
						className={`flex ${skill.isFolder && "hover:text-secondary"}`}
						onClick={onOpen}
					>
						<div className="flex px-3">
							{skill.isFolder ? (
								<>
									<div className="mr-1">
										{skill.isExpanded ? (
											<ChevronDownIcon className=" icon h-5 text-lg" />
										) : (
											<ChevronRightIcon className="icon h-5 text-lg" />
										)}
									</div>
									<IconWithNumber
										number={skill.skill.children.length}
										style={{
											color: "white",
											// fontWeight: "bold",
											fontSize: "10px"
										}}
									>
										<FolderIcon className="icon h-5 text-lg" />
									</IconWithNumber>
								</>
							) : (
								<div className="ml-6">
									<PuzzleIcon className="icon h-5 text-lg" />
								</div>
							)}
						</div>
						{skill.cycleType !== "none" && (
							<RefreshIcon className="icon h-5 text-lg text-red-500" />
						)}
						{/* TODO {displayInfo.isParent && !displayInfo.hasCycle && (
								<ShieldExclamationIcon className="icon h-5 text-lg text-yellow-500" />
							)} */}
						<span className={`${skill.isSelected ? "text-secondary" : ""}`}>
							{skill.displayName ?? skill.skill.name}
						</span>
						<span className="ml-1 text-xs text-gray-500">{skill.skill.id}</span>
					</div>
					<div className="invisible  group-hover:visible">
						<QuickEditButton onClick={() => handleSelection(skill.id)} skill={skill} />
						<AddChildButton
							parentSkill={skill.skill}
							updateSkillDisplay={updateSkillDisplay}
							handleSelection={handleSelection}
						/>
						<SkillDeleteOption
							skillIds={[skill.id]}
							className="px-2 hover:text-secondary"
						/>
					</div>
				</div>
			</TableDataColumn>
			<TableDataColumn>{"nicht vorhanden"}</TableDataColumn>
		</tr>
	);
}

function QuickEditButton({
	onClick,
	skill
}: {
	onClick: () => void;
	skill: SkillFolderVisualization;
}) {
	return (
		<button
			title="Bearbeiten"
			className="mr-3 px-2 hover:text-secondary"
			onClick={onClick}
			disabled={skill.isSelected}
		>
			<PencilIcon className="ml-1 h-5 text-lg" />
		</button>
	);
}

const IconWithNumber: React.FC<{
	number: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({ number, children, style }) => (
	<div style={{ position: "relative" }}>
		{children}
		<span
			style={{
				position: "absolute",
				top: "50%",
				left: "10%",
				transform: "translate(-50%, -50%)",
				...style
			}}
		>
			{number}
		</span>
	</div>
);
