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
import styles from "../folder-table.module.css";
import { SkillFolderVisualization, SkillSelectHandler, UpdateVisuals } from "../skill-display";
import { isTruthy } from "@self-learning/util/common";
import { Draggable, DraggableStateSnapshot, DraggableStyle, Droppable } from "@hello-pangea/dnd";
import { useSafeModuleViewContext } from "@self-learning/teaching";
import { useFormContext } from "react-hook-form";

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
	textClassName
}: {
	skillResolver: (skillId: string) => SkillFolderVisualization | undefined;
	skillDisplayData: SkillFolderVisualization;
	depth?: number;
	handleSelection: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
	renderedIds?: Set<string>;
	parentNodeId: string;
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
						// recursive structure to add <SkillRow /> for each child
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
	textClassName
}: {
	skill: SkillFolderVisualization;
	depth: number;
	handleSelection: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
	nodeId: string;
	textClassName?: string;
}) {
	const { getValues } = useFormContext<MyFormValues>();
	const context = useSafeModuleViewContext();
	if (!context) {
		console.error(
			"ModuleViewContext is not available. Please ensure you are using this component within a ModuleViewProvider."
		);
		return null;
	}
	const { allSkills, modules } = context;
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

	type MyFormValues = {
		provides: {
			children: string[];
			description: string | null;
			name: string;
			id: string;
			authorId: number;
			parents: string[];
		}[];
		requires: {
			children: string[];
			description: string | null;
			name: string;
			id: string;
			authorId: number;
			parents: string[];
		}[];
	};
	const isRequiredSkill = (skillId: string): boolean => {
		const skill = allSkills.get(skillId);
		const requires = getValues("requires") ?? [];
		const alreadyRequired = requires.some(s => s.id === skill?.id);
		if (alreadyRequired) {
			return true;
		}
		for (const module of modules.values()) {
			if (module.requires?.some(s => s.id === skillId)) {
				return true;
			}
		}
		return false;
	};
	const isProvidedSkill = (skillId: string): boolean => {
		const skill = allSkills.get(skillId);
		const provides = getValues("provides") ?? [];
		const alreadyProvided = provides.some(s => s.id === skill?.id);
		if (alreadyProvided) {
			return true;
		}
		for (const module of modules.values()) {
			if (module.provides?.some(s => s.id === skillId)) {
				return true;
			}
		}
		return false;
	};
	const isUsedinCurrentModule = (skillId: string): boolean => {
		const skill = allSkills.get(skillId);
		const provides = getValues("provides") ?? [];
		const requires = getValues("requires") ?? [];
		const alreadyUsed =
			provides.some(s => s.id === skill?.id) || requires.some(s => s.id === skill?.id);
		if (alreadyUsed) {
			return true;
		}
		return false;
	};

	let title = "";
	if (skill.isCycleMember) {
		title = "Dieser Skill ist Teil eines Zyklus.";
	} else if (skill.hasNestedCycleMembers) {
		title = "Dieser Ordner enthält einen Zyklus, ist aber kein Teil davon.";
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

	function checkDraggableSetting(skill: SkillFolderVisualization): boolean {
		if (isUsedinCurrentModule(skill.id)) {
			return true;
		}
		if (skill.skill.children.length > 0 && skill.skill.parents.length === 0) {
			return true;
		}
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
                ${isUsedinCurrentModule(skill.id) ? "bg-gray-50" : ""}`}
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
															className={`icon h-5 text-lg ${isProvidedSkill?.(skill.id) ? "text-emerald-500" : ""}`}
														/>
													</>
												) : (
													<div className="ml-6">
														{isProvidedSkill(skill.id) &&
														isRequiredSkill(skill.id) ? (
															<PuzzlePieceIconSolid className="icon h-5 text-lg text-emerald-500" />
														) : isProvidedSkill(skill.id) ? (
															<PuzzlePieceIconOutline className="icon h-5 text-lg text-emerald-500" />
														) : (
															<PuzzlePieceIconOutline className="icon h-5 text-lg" />
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
												{isUsedinCurrentModule(skill.id) && (
													<LockClosedIcon className="text-gray-400 h-4 w-4 flex-shrink-0" />
												)}
											</span>
										</div>
									</div>
								)}
							</Draggable>
						</div>
					)}
				</Droppable>
			</TableDataColumn>
		</tr>
	);
}
