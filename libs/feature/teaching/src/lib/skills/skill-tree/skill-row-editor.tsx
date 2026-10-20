import { useTranslation } from "next-i18next";
import { Tooltip } from "@self-learning/ui/common";
import {
	ArrowRightStartOnRectangleIcon,
	StarIcon as TaughtGoalIcon
} from "@heroicons/react/24/solid";
import {
	LockClosedIcon,
	ArrowLongRightIcon,
	QuestionMarkCircleIcon as UnusedSkillIcon
} from "@heroicons/react/24/outline";
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
import { SkillTreeRows, type SkillIdLookup } from "../skill-tree-rows";
import { SkillTreeRow } from "../skill-tree-row";
import type { SkillTreeRowProps } from "../skill-tree-row";
import { SkillRowDeleteButton } from "../skill-row-delete-button";

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
	matchingSkillIds?: SkillIdLookup;
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
	const isSkillUsed = (skillId: string) =>
		!!ctx &&
		(ctx.lessonRequired.has(skillId) ||
			ctx.lessonProvided.has(skillId) ||
			ctx.courseRequired.has(skillId) ||
			ctx.courseProvided.has(skillId));

	const isRootItem = skill.skill.children.length > 0 && skill.skill.parents.length === 0;
	return (
		<SkillTreeRow
			{...rowProps}
			skill={skill}
			isRepository={isRootItem}
			isDragDisabled={isUsedInCurrent}
			className={isUsedInCurrent ? "bg-gray-50" : ""}
			repositoryIconClassName={isProvided ? "text-emerald-500" : ""}
			label={
				<>
					<ConnectedSkill
						name={skill.displayName ?? skill.skill.name}
						enabled={!!ctx && !isRootItem}
						showLeftIcon={!skill.skill.children.some(isSkillUsed)}
						showRightIcon={!skill.skill.parents.some(isSkillUsed)}
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
				<>
					<CreateChildSkillButton
						parentId={skill.id}
						onCreate={() => handleCreation({ parentId: skill.id })}
					/>
					<SkillRowDeleteButton skillId={skill.id} />
				</>
			}
		/>
	);
}

export function ConnectedSkill({
	name,
	enabled,
	showLeftIcon = true,
	showRightIcon = true,
	isLessonProvided,
	isLessonRequired,
	isCourseRequired,
	isCourseProvided
}: {
	name: string;
	enabled: boolean;
	showLeftIcon?: boolean;
	showRightIcon?: boolean;
	isLessonProvided: boolean;
	isLessonRequired: boolean;
	isCourseRequired: boolean;
	isCourseProvided: boolean;
}) {
	const { t } = useTranslation(["feature-teaching", "common"]);
	const requiresFlagRed = isCourseRequired && isLessonProvided;
	const requiresFlagGreen = isCourseRequired && isLessonRequired;
	const RequiresFlagIcon = ArrowRightStartOnRectangleIcon;

	const providesFlagRed = isCourseProvided && isLessonRequired;
	const providesFlagGreen = isCourseProvided && isLessonProvided;

	const baseText = isCourseRequired
		? t("Skills_Course_Required")
		: isCourseProvided
			? t("Skills_Course_Provided")
			: "";
	const starText = requiresFlagRed
		? t("Skills_Course_Required_Lesson_Provided")
		: providesFlagRed
			? t("Skills_Course_Provided_Lesson_Required")
			: requiresFlagGreen || providesFlagGreen
				? isCourseRequired
					? t("Skills_Course_Lessons_Required")
					: t("Skills_Course_Lessons_Provided")
				: baseText;

	const error = requiresFlagRed || providesFlagRed;
	const isParticipating =
		isLessonProvided || isLessonRequired || isCourseRequired || isCourseProvided;

	const CONNECTED_COLOR = "text-green-500";
	const DISCONNECTED_COLOR = "text-red-500";

	const LeftIcon = isCourseRequired ? RequiresFlagIcon : ArrowLongRightIcon;
	const rightIconStyle = !isParticipating
		? "invisible"
		: !isCourseProvided
			? "text-blue-500"
			: error
				? DISCONNECTED_COLOR
				: CONNECTED_COLOR;

	const RightIcon = isCourseProvided ? TaughtGoalIcon : UnusedSkillIcon;
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
			? t("Skills_Lessons_Required_Provided")
			: isLessonRequired
				? t("Skills_Lessons_Required")
				: isLessonProvided
					? t("Skills_Lessons_Provided")
					: t("Skills_Unassigned");
	const text =
		isParticipating && !isCourseProvided
			? t("Skills_Unneeded_Lesson_Provided")
			: isCourseRequired || isCourseProvided
				? starText
				: pointText;

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
				{showLeftIcon && <LeftIcon className={clsx(`h-5 text-lg`, leftIconStyle)} />}
				<span className={middleStyle}>{name}</span>
				{showRightIcon && <RightIcon className={clsx(`h-5 text-lg`, rightIconStyle)} />}
			</span>
		</Tooltip>
	);
}
