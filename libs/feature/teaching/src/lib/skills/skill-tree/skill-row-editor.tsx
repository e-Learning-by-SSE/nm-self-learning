import { Tooltip } from "@self-learning/ui/common";
import {
	ArrowRightStartOnRectangleIcon,
	ArrowRightEndOnRectangleIcon
} from "@heroicons/react/24/solid";
import { LockClosedIcon, ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { CreateChildSkillButton } from "../create-child-skill-button";
import type {
	SkillCreateHandler,
	SkillFolderVisualization,
	SkillSelectHandler,
	UpdateVisuals
} from "../folder-editor/skill-display";
import { useContext } from "react";
import { SkillResourceContext } from "./skill-resource-context";
import { clsx } from "clsx";
import { SkillTreeRows } from "../skill-tree-rows";
import { SkillTreeRow } from "../skill-tree-row";
import type { SkillTreeRowProps } from "../skill-tree-row";

export function ListSkillEntryWithChildren({
	handleSelection,
	handleCreation,
	updateSkillDisplay,
	textClassName,
	...treeProps
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
	return (
		<SkillTreeRows
			{...treeProps}
			renderRow={position => (
				<SkillRow
					key={`${position.skill.id}-${position.depth}`}
					{...position}
					handleSelection={handleSelection}
					handleCreation={handleCreation}
					updateSkillDisplay={updateSkillDisplay}
					textClassName={textClassName}
				/>
			)}
		/>
	);
}

function SkillRow({
	skill,
	handleCreation,
	...rowProps
}: Pick<
	SkillTreeRowProps,
	"skill" | "depth" | "nodeId" | "handleSelection" | "updateSkillDisplay" | "textClassName"
> & { handleCreation: SkillCreateHandler }) {
	const ctx = useContext(SkillResourceContext);
	if (!ctx) console.warn("skill row is used without context");
	// if ctx is empty - its just skill view
	const isRequired = !!ctx?.lessonRequired.has(skill.id);
	const isProvided = !!ctx?.lessonProvided.has(skill.id);
	const isUsedInCurrent = !!ctx?.current.has(skill.id);
	const isCourseRequired = !!ctx?.courseRequired.has(skill.id);
	const isCourseProvided = !!ctx?.courseProvided.has(skill.id);

	const isRootItem = skill.skill.children.length > 0 && skill.skill.parents.length === 0;
	return (
		<SkillTreeRow
			{...rowProps}
			skill={skill}
			isRepository={isRootItem}
			isDragDisabled={isUsedInCurrent || isRootItem}
			className={isUsedInCurrent ? "bg-gray-50" : ""}
			repositoryIconClassName={isProvided ? "text-emerald-500" : ""}
			label={
				<>
					<ConnectedSkill
						name={skill.displayName ?? skill.skill.name}
						enabled={!!ctx && !isRootItem}
						isLessonProvided={isProvided}
						isLessonRequired={isRequired}
						isCourseProvided={isCourseProvided}
						isCourseRequired={isCourseRequired}
					/>
					{isUsedInCurrent && (
						<LockClosedIcon className="text-gray-400 h-4 w-4 flex-shrink-0" />
					)}
				</>
			}
			actions={
				<CreateChildSkillButton onCreate={() => handleCreation({ parentId: skill.id })} />
			}
		/>
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

	const CONNECTED_COLOR = "text-green-500";
	const DISCONNECTED_COLOR = "text-red-500";

	const LeftIcon = isCourseRequired ? RequiresFlagIcon : ArrowLongRightIcon;
	const rightIconStyle = error
		? DISCONNECTED_COLOR
		: isCourseProvided || isLessonRequired || providesFlagGreen
			? CONNECTED_COLOR
			: isParticipating
				? DISCONNECTED_COLOR
				: "invisible";

	const RightIcon = isCourseProvided ? ProvidesFlagIcon : ArrowLongRightIcon;
	const leftIconStyle = error
		? DISCONNECTED_COLOR
		: isCourseRequired || isLessonProvided || requiresFlagGreen
			? CONNECTED_COLOR
			: isParticipating
				? DISCONNECTED_COLOR
				: "invisible";

	// highlight if any
	const middleStyle = error ? DISCONNECTED_COLOR : isParticipating ? CONNECTED_COLOR : "";
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
