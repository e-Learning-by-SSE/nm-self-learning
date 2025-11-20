import { TableDataColumn, IconOnlyButton } from "@self-learning/ui/common";
import React from "react";
import {
	ChevronDownIcon,
	ChevronRightIcon,
	FolderIcon,
	ArrowPathRoundedSquareIcon,
	ShieldExclamationIcon
} from "@heroicons/react/24/solid";
import { PencilIcon, PuzzlePieceIcon } from "@heroicons/react/24/outline";
import { AddChildButton, SkillDeleteOption } from "./skill-taskbar";
import styles from "./folder-table.module.css";
import { SkillFolderVisualization, SkillSelectHandler, UpdateVisuals } from "./skill-display";
import { isTruthy } from "@self-learning/util/common";

export function ListSkillEntryWithChildren({
	skillResolver,
	skillDisplayData,
	depth = 0,
	handleSelection,
	updateSkillDisplay,
	renderedIds = new Set()
}: {
	skillResolver: (skillId: string) => SkillFolderVisualization | undefined;
	skillDisplayData: SkillFolderVisualization;
	depth?: number;
	handleSelection: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
	renderedIds?: Set<string>;
}) {
	const wasNotRendered = (skill: SkillFolderVisualization) => !renderedIds.has(skill.id);
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
					.filter(wasNotRendered)
					.map(element => {
						// recursive structure to add <SkillRow /> for each child
						const newSet = new Set(renderedIds);
						newSet.add(element.id);
						return (
							<ListSkillEntryWithChildren
								key={`${element.id}-${depth + 1}`}
								skillDisplayData={element}
								updateSkillDisplay={updateSkillDisplay}
								skillResolver={skillResolver}
								handleSelection={handleSelection}
								depth={depth + 1}
								renderedIds={newSet}
							/>
						);
					})}
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

	let title = "";
	if (skill.isCycleMember) {
		title = "Dieser Skill ist Teil eines Zyklus.";
	} else if (skill.hasNestedCycleMembers) {
		title = "Dieser Ordner enthält einen Zyklus, ist aber kein Teil davon.";
	}
	const cycleError = skill.isCycleMember;
	const cycleWarning = skill.hasNestedCycleMembers && !skill.isSelected && !skill.isCycleMember;
	return (
		<tr
			style={depthCssStyle}
			title={title}
			className={`group cursor-pointer hover:bg-c-hover-muted ${cycleError ? "bg-c-danger-subtle" : ""}
				${cycleWarning ? "bg-yellow-100" : ""}
				${skill.isSelected ? "bg-c-surface-3" : ""} `}
		>
			<TableDataColumn className={"text-center align-middle"}>
				<input
					className="secondary form-checkbox rounded text-c-primary focus:ring-c-primary"
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
						className={`flex ${skill.isFolder && "hover:text-c-primary"}`}
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
									<PuzzlePieceIcon className="icon h-5 text-lg" />
								</div>
							)}
						</div>
						{cycleError && (
							<ArrowPathRoundedSquareIcon className="icon h-5 text-lg text-c-danger" />
						)}
						{cycleWarning && (
							<ShieldExclamationIcon className="icon h-5 text-lg text-yellow-500" />
						)}
						<span className={`${skill.isSelected ? "text-c-primary" : ""}`}>
							{skill.displayName ?? skill.skill.name}
						</span>
						<span className="ml-1 text-xs text-c-text-muted">{skill.skill.id}</span>
					</div>
					<div className="invisible group-hover:visible">
						<QuickEditButton onClick={() => handleSelection(skill.id)} skill={skill} />
						<AddChildButton
							parentSkill={skill.skill}
							updateSkillDisplay={updateSkillDisplay}
							handleSelection={handleSelection}
						/>
						<SkillDeleteOption skillIds={[skill.id]} inline={true} />
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
		<IconOnlyButton
			title="Bearbeiten"
			variant="hover-icon"
			icon={<PencilIcon className="h-5 text-lg" />}
			onClick={onClick}
			disabled={skill.isSelected}
		/>
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
