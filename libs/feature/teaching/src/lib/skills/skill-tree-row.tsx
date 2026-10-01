import { useTranslation } from "next-i18next";
import { TableDataColumn } from "@self-learning/ui/common";
import type React from "react";
import type { ReactNode } from "react";
import type { SkillTreeRowPosition } from "./skill-tree-rows";
import { SkillIcon } from "./skill-icon";
import {
	ChevronDownIcon,
	ArrowPathRoundedSquareIcon,
	ShieldExclamationIcon,
	ChevronRightIcon
} from "@heroicons/react/24/solid";
import styles from "./folder-editor/folder-table.module.css";
import type { SkillSelectHandler, UpdateVisuals } from "./folder-editor/skill-display";
import { Draggable, DraggableStateSnapshot, DraggableStyle, Droppable } from "@hello-pangea/dnd";

export type SkillTreeRowProps = SkillTreeRowPosition & {
	handleSelection: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
	textClassName?: string;
	label?: ReactNode;
	actions?: ReactNode;
	className?: string;
	selectionClassName?: string;
	repositoryIconClassName?: string;
	isRepository: boolean;
	isDragDisabled: boolean;
};

export function SkillTreeRow({
	skill,
	depth,
	handleSelection,
	updateSkillDisplay,
	nodeId,
	textClassName,
	label,
	actions,
	className = "",
	selectionClassName = "",
	repositoryIconClassName = "",
	isRepository,
	isDragDisabled
}: SkillTreeRowProps) {
	const { t } = useTranslation(["feature-teaching", "common"]);
	const depthCssStyle = {
		"--depth": depth
	} as React.CSSProperties;
	const onOpen = () => {
		// disables highlight effect after user interacted with the element
		const childrenDisplays = skill.children.map(cid => ({
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
		title = t("Skills_Cycle_Member");
	} else if (skill.hasNestedCycleMembers) {
		title = t("Skills_Nested_Cycle");
	}
	const cycleError = skill.isCycleMember;
	const cycleWarning = skill.hasNestedCycleMembers && !skill.isSelected && !skill.isCycleMember;

	// Stop move over the Repository
	// https://github.com/atlassian/react-beautiful-dnd/issues/374#issuecomment-569817782
	function getStyle(
		style: DraggableStyle | undefined,
		snapshot: DraggableStateSnapshot
	): React.CSSProperties | undefined {
		if (!snapshot.isDragging) return {};
		if (!snapshot.isDropAnimating) {
			return style;
		}

		return {
			...style,
			// cannot be 0, but make it super tiny
			transitionDuration: `0.001s`
		};
	}

	return (
		<tr
			style={depthCssStyle}
			title={title}
			className={`group cursor-pointer transition-colors duration-150
				hover:bg-gray-50
				${cycleError ? "bg-red-100" : ""}
				${cycleWarning ? "bg-yellow-100" : ""}
				${skill.isSelected ? "bg-gray-200 ring-inset ring-2 ring-gray-400" : ""} ${className}`}
		>
			<TableDataColumn
				className={`${styles["folder-line"]} ${
					skill.shortHighlight ? "animate-highlight rounded-md" : ""
				} text-sm font-medium`}
			>
				<Droppable droppableId={nodeId} direction="vertical">
					{provided => (
						<div ref={provided.innerRef} {...provided.droppableProps}>
							<Draggable
								key={skill.id}
								draggableId={nodeId}
								index={1}
								isDragDisabled={isDragDisabled}
							>
								{(provided, snapshot) => (
									<div
										className="flex items-center gap-2 px-3 py-2 w-full"
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
										style={getStyle(provided.draggableProps.style, snapshot)}
									>
										<div
											className={`flex ${selectionClassName}`}
											onClick={() => handleSelection(skill.id)}
										>
											<div className="flex items-center px-2 gap-1 min-w-[2rem]">
												{skill.isFolder ? (
													<>
														<div className="mr-1">
															{skill.isExpanded ? (
																<ChevronDownIcon
																	className=" icon h-5 text-lg"
																	onClickCapture={() => onOpen()}
																/>
															) : (
																<ChevronRightIcon
																	className="icon h-5 text-lg"
																	onClickCapture={() => onOpen()}
																/>
															)}
														</div>
														{/* Area, nested group, and leaf are different shapes. */}
														<SkillIcon
															isRepository={isRepository}
															isGroup={!isRepository}
															className={
																isRepository
																	? repositoryIconClassName
																	: ""
															}
														/>
													</>
												) : (
													<div className="ml-6">
														<SkillIcon isRepository={false} />
													</div>
												)}
											</div>
											{cycleError && (
												<ArrowPathRoundedSquareIcon className="icon h-5 text-lg text-red-500" />
											)}
											{cycleWarning && (
												<ShieldExclamationIcon className="icon h-5 text-lg text-yellow-500" />
											)}
											<span
												className={`flex items-center gap-1 text-sm font-medium text-gray-800 ${textClassName}`}
											>
												{label ?? skill.displayName ?? skill.skill.name}
											</span>
										</div>
										{actions}
									</div>
								)}
							</Draggable>
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</TableDataColumn>
		</tr>
	);
}
