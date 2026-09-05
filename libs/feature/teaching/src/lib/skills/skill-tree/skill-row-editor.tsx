import { IconOnlyButton, TableDataColumn, Tooltip } from "@self-learning/ui/common";
import {
	ChevronDownIcon,
	FolderIcon,
	ArrowPathRoundedSquareIcon,
	ShieldExclamationIcon,
	ChevronRightIcon,
	ArrowRightStartOnRectangleIcon,
	ArrowRightEndOnRectangleIcon
} from "@heroicons/react/24/solid";
import { LockClosedIcon, ArrowLongRightIcon, FolderPlusIcon } from "@heroicons/react/24/outline";
import styles from "../folder-editor/folder-table.module.css";
import { isTruthy } from "@self-learning/util/common";
import { Draggable, DraggableStateSnapshot, DraggableStyle, Droppable } from "@hello-pangea/dnd";
import {
	SkillCreateHandler,
	SkillFolderVisualization,
	SkillSelectHandler,
	UpdateVisuals
} from "../folder-editor/skill-display";
import { useContext } from "react";
import { SkillResourceContext } from "./skill-resource-context";
import { clsx } from "clsx";

/**
 * Recursive folder row for the lesson/course skill tree.
 * Copy of module-view-skill-row without ModuleViewContext / useFormContext.
 * Catalog CRUD stays in skill-row-entry.tsx (AddChildButton).
 */
export function ListSkillEntryWithChildren({
	skillResolver,
	skillDisplayData,
	depth = 0,
	handleSelection,
	handleCreation,
	updateSkillDisplay,
	renderedIds = new Set(),
	parentNodeId,
	matchingSkillIds,
	autoExpandIds,
	textClassName
}: {
	// children[] is ids only — look up siblings in the catalog map
	skillResolver: (skillId: string) => SkillFolderVisualization | undefined;
	skillDisplayData: SkillFolderVisualization;
	depth?: number;
	handleSelection: SkillSelectHandler;
	handleCreation: SkillCreateHandler;
	updateSkillDisplay: UpdateVisuals;
	// skill graph can cycle; skip ids already on this path
	renderedIds?: Set<string>;
	// DnD id = ancestor path joined with ":::" (parsed on drop as last segment)
	parentNodeId: string;
	// search: keep a child only if it or a descendant matches
	matchingSkillIds?: Set<string>;
	autoExpandIds?: Set<string>;
	textClassName?: string;
}) {
	const wasNotRendered = (skill: SkillFolderVisualization) => !renderedIds.has(skill.id);
	const showChildren = skillDisplayData.isExpanded ?? false;
	const nodeId = generateNodeId(parentNodeId, skillDisplayData.id);

	if (autoExpandIds?.has(skillDisplayData.id)) {
		skillDisplayData.isExpanded = true;
	}

	return (
		<>
			<SkillRow
				key={`${skillDisplayData.id}-${depth}`}
				skill={skillDisplayData}
				depth={depth}
				handleSelection={handleSelection}
				handleCreation={handleCreation}
				updateSkillDisplay={updateSkillDisplay}
				nodeId={nodeId}
				textClassName={textClassName}
			/>
			{showChildren &&
				skillDisplayData.children
					.map(childId => skillResolver(childId))
					.sort(byChildrenLength)
					.filter(isTruthy)
					.filter(wasNotRendered)
					.map(element => {
						if (matchingSkillIds) {
							const hasMatchingDescendant = (
								skill: SkillFolderVisualization
							): boolean => {
								if (matchingSkillIds.has(skill.id)) return true;
								return skill.children
									.map(childId => skillResolver(childId))
									.filter(isTruthy)
									.some(child => hasMatchingDescendant(child));
							};
							if (!hasMatchingDescendant(element)) {
								return null;
							}
						}
						const newSet = new Set(renderedIds);
						newSet.add(element.id);
						return (
							<ListSkillEntryWithChildren
								key={`${element.id}-${depth + 1}`}
								skillDisplayData={element}
								updateSkillDisplay={updateSkillDisplay}
								skillResolver={skillResolver}
								handleSelection={handleSelection}
								handleCreation={handleCreation}
								depth={depth + 1}
								renderedIds={newSet}
								parentNodeId={nodeId}
								matchingSkillIds={matchingSkillIds}
								autoExpandIds={autoExpandIds}
								textClassName={textClassName}
							/>
						);
					})}
		</>
	);
}

const generateNodeId = (parentsId: string, skillId: string) => {
	return parentsId.length > 0 ? parentsId + ":::" + skillId : skillId;
};

const byChildrenLength = (
	a: SkillFolderVisualization | undefined,
	b: SkillFolderVisualization | undefined
) => {
	if (a && b) {
		return b.numberChildren - a.numberChildren || a.skill.name.localeCompare(b.skill.name);
	}
	return 0;
};

function SkillRow({
	skill,
	depth,
	handleSelection,
	handleCreation,
	updateSkillDisplay,
	nodeId,
	textClassName
}: {
	skill: SkillFolderVisualization;
	depth: number;
	handleSelection: SkillSelectHandler;
	handleCreation: SkillCreateHandler;
	updateSkillDisplay: UpdateVisuals;
	nodeId: string;
	textClassName?: string;
}) {
	const ctx = useContext(SkillResourceContext);
	if (!ctx) console.warn("skill row is used without context");
	// if ctx is empty - its just skill view
	const isRequired = !!ctx?.lessonRequired.has(skill.id);
	const isProvided = !!ctx?.lessonProvided.has(skill.id);
	const isUsedInCurrent = !!ctx?.current.has(skill.id);
	const isCourseRequired = !!ctx?.courseRequired.has(skill.id);
	const isCourseProvided = !!ctx?.courseProvided.has(skill.id);

	const depthCssStyle = { "--depth": depth } as React.CSSProperties;

	const onOpen = () => {
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
		title = "Dieser Skill ist Teil eines Zyklus.";
	} else if (skill.hasNestedCycleMembers) {
		title = "Dieser Ordner enthält einen Zyklus, ist aber kein Teil davon.";
	}
	const cycleError = skill.isCycleMember;
	const cycleWarning = skill.hasNestedCycleMembers && !skill.isSelected && !skill.isCycleMember;

	// react-beautiful-dnd: drop animation otherwise flies back to the tree
	function getStyle(
		style: DraggableStyle | undefined,
		snapshot: DraggableStateSnapshot
	): React.CSSProperties | undefined {
		if (!snapshot.isDragging) return {};
		if (!snapshot.isDropAnimating) {
			return style;
		}
		return { ...style, transitionDuration: `0.001s` };
	}

	function isRootItem(row: SkillFolderVisualization): boolean {
		return row.skill.children.length > 0 && row.skill.parents.length === 0;
	}

	function checkDraggableSetting(row: SkillFolderVisualization): boolean {
		if (ctx?.current.has(row.id)) return true;
		// root folder is a grouping node, not an assignable skill
		return isRootItem(row);
	}

	return (
		<tr
			style={depthCssStyle}
			title={title}
			className={`group cursor-pointer transition-colors duration-150
                hover:bg-gray-50
                ${cycleError ? "bg-red-100" : ""}
                ${cycleWarning ? "bg-yellow-100" : ""}
                ${skill.isSelected ? "bg-gray-200 ring-inset ring-2 ring-gray-400" : ""}
                ${isUsedInCurrent ? "bg-gray-50" : ""}`}
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
								isDragDisabled={checkDraggableSetting(skill)}
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
											className={`flex`}
											onClick={() => handleSelection(skill.id)}
										>
											<div className="flex items-center px-2 gap-1 min-w-[2rem]">
												{skill.isFolder && (
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
														{isRootItem(skill) && (
															<FolderIcon
																className={`icon h-5 text-lg ${isProvided ? "text-emerald-500" : ""}`}
															/>
														)}
													</>
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
												<ConnectedSkill
													name={skill.displayName ?? skill.skill.name}
													enabled={!!ctx && !isRootItem(skill)}
													isLessonProvided={isProvided}
													isLessonRequired={isRequired}
													isCourseProvided={isCourseProvided}
													isCourseRequired={isCourseRequired}
												/>

												{isUsedInCurrent && (
													<LockClosedIcon className="text-gray-400 h-4 w-4 flex-shrink-0" />
												)}
											</span>
										</div>
										<IconOnlyButton
											icon={<FolderPlusIcon className="h-4 w-4" />}
											className={`${styles["skill-row-add"]} invisible group-hover:visible ml-auto !p-1`}
											title={"Neuen Skill in dieser Skillgruppe erstellen"}
											onClick={event => {
												event.preventDefault();
												event.stopPropagation();
												handleCreation({ parentId: skill.id });
											}}
										/>
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

export function ConnectedSkill({
	name,
	enabled,
	isLessonProvided,
	isLessonRequired,
	isCourseRequired,
	isCourseProvided
}: {
	name: string;
	enabled: boolean;
	isLessonProvided: boolean;
	isLessonRequired: boolean;
	isCourseRequired: boolean;
	isCourseProvided: boolean;
}) {
	const requiresFlagRed = isCourseRequired && isLessonProvided;
	const requiresFlagGreen = isCourseRequired && isLessonRequired;
	const RequiresFlagIcon = ArrowRightStartOnRectangleIcon;

	const providesFlagRed = isCourseProvided && isLessonRequired;
	const providesFlagGreen = isCourseProvided && isLessonProvided;
	const ProvidesFlagIcon = ArrowRightEndOnRectangleIcon;

	const baseText = isCourseRequired
		? "required by course"
		: isCourseProvided
			? "provided by course"
			: "";
	const starText = requiresFlagRed
		? "course provides what requires"
		: providesFlagRed
			? "course requires what provides"
			: requiresFlagGreen || providesFlagGreen
				? `${baseText} and by lesson(s)`
				: baseText;

	const error = requiresFlagRed || providesFlagRed;
	const isParticipating =
		isLessonProvided || isLessonRequired || isCourseRequired || isCourseProvided;

	const LeftIcon = isCourseRequired ? RequiresFlagIcon : ArrowLongRightIcon;
	const rightIconStyle = error
		? "text-red-500"
		: isCourseProvided || isLessonRequired || providesFlagGreen
			? "text-emerald-500"
			: isParticipating
				? "text-red-500"
				: "invisible";

	const RightIcon = isCourseProvided ? ProvidesFlagIcon : ArrowLongRightIcon;
	const leftIconStyle = error
		? "text-red-500"
		: isCourseRequired || isLessonProvided || requiresFlagGreen
			? "text-emerald-500"
			: isParticipating
				? "text-red-500"
				: "invisible";

	// highlight if any
	const middleStyle = error ? "text-red-500" : isParticipating ? "text-emerald-500" : "";
	const pointText =
		isLessonRequired && isLessonProvided
			? "required and provided by lessons"
			: isLessonRequired
				? "required by lesson(s)"
				: isLessonProvided
					? "provided by lesson(s)"
					: "not allocated";
	const text = isCourseRequired || isCourseProvided ? starText : pointText;

	if (!enabled) {
		return (
			<span className="flex">
				<span className={middleStyle}>{name}</span>
			</span>
		);
	}

	return (
		<Tooltip content={text} className="inline-flex">
			<span className="flex">
				<LeftIcon className={clsx(`h-5 text-lg`, leftIconStyle)} />
				<span className={middleStyle}>{name}</span>
				<RightIcon className={clsx(`h-5 text-lg`, rightIconStyle)} />
			</span>
		</Tooltip>
	);
}
