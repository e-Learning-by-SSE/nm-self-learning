import { TableDataColumn } from "@self-learning/ui/common";
import {
	ChevronDownIcon,
	FolderIcon,
	ArrowPathRoundedSquareIcon,
	ShieldExclamationIcon,
	ChevronRightIcon
} from "@heroicons/react/24/solid";
import { PuzzlePieceIcon as PuzzlePieceIconSolid } from "@heroicons/react/24/solid";
import {
	LockClosedIcon,
	PuzzlePieceIcon as PuzzlePieceIconOutline
} from "@heroicons/react/24/outline";
import styles from "../folder-editor/folder-table.module.css";
import { isTruthy } from "@self-learning/util/common";
import { Draggable, DraggableStateSnapshot, DraggableStyle, Droppable } from "@hello-pangea/dnd";
import {
	SkillFolderVisualization,
	SkillSelectHandler,
	UpdateVisuals
} from "../folder-editor/skill-display";

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
	updateSkillDisplay,
	renderedIds = new Set(),
	parentNodeId,
	matchingSkillIds,
	autoExpandIds,
	textClassName,
	requiredIds,
	providedIds,
	currentIds
}: {
	// children[] is ids only — look up siblings in the catalog map
	skillResolver: (skillId: string) => SkillFolderVisualization | undefined;
	skillDisplayData: SkillFolderVisualization;
	depth?: number;
	handleSelection: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
	// skill graph can cycle; skip ids already on this path
	renderedIds?: Set<string>;
	// DnD id = ancestor path joined with ":::" (parsed on drop as last segment)
	parentNodeId: string;
	// search: keep a child only if it or a descendant matches
	matchingSkillIds?: Set<string>;
	autoExpandIds?: Set<string>;
	textClassName?: string;
	// usage overlay from parent (form / getSkillContext)
	requiredIds: Set<string>;
	providedIds: Set<string>;
	currentIds: Set<string>;
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
				updateSkillDisplay={updateSkillDisplay}
				nodeId={nodeId}
				textClassName={textClassName}
				requiredIds={requiredIds}
				providedIds={providedIds}
				currentIds={currentIds}
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
								depth={depth + 1}
								renderedIds={newSet}
								parentNodeId={nodeId}
								matchingSkillIds={matchingSkillIds}
								autoExpandIds={autoExpandIds}
								textClassName={textClassName}
								requiredIds={requiredIds}
								providedIds={providedIds}
								currentIds={currentIds}
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
	updateSkillDisplay,
	nodeId,
	textClassName,
	requiredIds,
	providedIds,
	currentIds
}: {
	skill: SkillFolderVisualization;
	depth: number;
	handleSelection: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
	nodeId: string;
	textClassName?: string;
	requiredIds: Set<string>;
	providedIds: Set<string>;
	currentIds: Set<string>;
}) {
	const isRequired = requiredIds.has(skill.id);
	const isProvided = providedIds.has(skill.id);
	const isUsedInCurrent = currentIds.has(skill.id);

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

	function checkDraggableSetting(row: SkillFolderVisualization): boolean {
		if (currentIds.has(row.id)) return true;
		// root folder is a grouping node, not an assignable skill
		if (row.skill.children.length > 0 && row.skill.parents.length === 0) return true;
		return false;
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
											className={`flex ${skill.isFolder && "hover:text-secondary"}`}
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
														<FolderIcon
															className={`icon h-5 text-lg ${isProvided ? "text-emerald-500" : ""}`}
														/>
													</>
												) : (
													<div className="ml-6">
														{isProvided && isRequired ? (
															<PuzzlePieceIconSolid className="icon h-5 text-emerald-500" />
														) : isProvided ? (
															<PuzzlePieceIconOutline className="icon h-5 text-emerald-500" />
														) : isRequired ? (
															<PuzzlePieceIconOutline className="icon h-5 text-red-500" />
														) : (
															<PuzzlePieceIconOutline className="icon h-5" />
														)}
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
												{skill.displayName ?? skill.skill.name}
												{isUsedInCurrent && (
													<LockClosedIcon className="text-gray-400 h-4 w-4 flex-shrink-0" />
												)}
											</span>
										</div>
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
