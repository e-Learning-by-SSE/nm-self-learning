import { useTranslation } from "next-i18next";
/* eslint-disable react/jsx-no-useless-fragment */
import { SkillFormModel } from "@self-learning/types";
import { Dialog, DialogActions, LoadingBox, OnDialogCloseFn } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";
import { memo, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SearchField } from "@self-learning/ui/forms";
import { useRequiredSession } from "@self-learning/ui/layouts";
import {
	AddSkillChildrenDialog,
	directChildSkills,
	isSkillArea,
	toastDeniedSkillAccess
} from "./add-skill-children-dialog";
import { OnlyOwnSkillsCheckbox, useAccessibleSkillIds } from "../only-own-skills-checkbox";
import { SkillIcon } from "../skill-icon";
import { compareSkills } from "../compare-skills";
import { SkillResourceContext } from "../skill-tree/skill-resource-context";
import { ConnectedSkill } from "../skill-tree/skill-row-editor";
import { isTruthy } from "@self-learning/util/common";

export type SkillSelectionChange = {
	added: SkillFormModel[];
	removed: SkillFormModel[];
};

export function SelectSkillDialog({
	onClose,
	skills: skillsFromParent,
	excludedIds,
	selectedIds,
	allowSelectRoots = true,
	restrictToOwnSkills = false
}: {
	onClose: OnDialogCloseFn<SkillSelectionChange>;
	skills?: SkillFormModel[];
	excludedIds?: ReadonlySet<string>;
	selectedIds?: ReadonlySet<string>;
	allowSelectRoots: boolean;
	restrictToOwnSkills?: boolean;
}) {
	const { t } = useTranslation(["feature-teaching", "common"]);
	const ctx = useContext(SkillResourceContext);
	if (!ctx) console.warn("SelectSkillDialog: SkillResourceContext missing");

	const { data: fetched, isLoading } = trpc.skill.getSkills.useQuery(undefined, {
		enabled: !skillsFromParent
	});
	const skills = (skillsFromParent ?? (fetched as SkillFormModel[] | undefined) ?? []).filter(
		skill => selectedIds?.has(skill.id) || !excludedIds?.has(skill.id)
	);

	return (
		<Dialog onClose={() => onClose(undefined)} title={t("Skills_Select_Title")}>
			{!skillsFromParent && isLoading ? (
				<LoadingBox />
			) : (
				<>
					<SelectSkillForm
						onClose={onClose}
						//skills is missing some properties here
						skills={skills}
						selectedIds={selectedIds}
						allowSelectRoots={allowSelectRoots}
						restrictToOwnSkills={restrictToOwnSkills}
					/>
				</>
			)}
		</Dialog>
	);
}

function SelectSkillForm({
	onClose,
	skills,
	selectedIds,
	allowSelectRoots,
	restrictToOwnSkills = false
}: {
	onClose: OnDialogCloseFn<SkillSelectionChange>;
	skills: SkillFormModel[];
	selectedIds?: ReadonlySet<string>;
	allowSelectRoots: boolean;
	restrictToOwnSkills?: boolean;
}) {
	const { t } = useTranslation(["feature-teaching", "common"]);
	const session = useRequiredSession();
	const isAdmin = session.data?.user.role === "ADMIN";
	// Non-admins cannot turn the filter off when choosing provided skills.
	const lockToOwnSkills = restrictToOwnSkills && !isAdmin;
	const [search, setSearch] = useState("");
	const [onlyOwnSkills, setOnlyOwnSkills] = useState(true);
	const filterToOwnSkills = lockToOwnSkills || onlyOwnSkills;
	const accessibleSkillIds = useAccessibleSkillIds(filterToOwnSkills);
	// key by id — object identity breaks after getSkills refetch
	const [checkedIds, setCheckedIds] = useState(() => new Set(selectedIds));
	const [pendingArea, setPendingArea] = useState<SkillFormModel | null>(null);
	const pickSkillArea = useCallback(
		(skill: SkillFormModel) => {
			// Same rule as drop: no access to the area means no children dialog.
			if (lockToOwnSkills && !accessibleSkillIds?.has(skill.id)) {
				toastDeniedSkillAccess(t, skill.name);
				return;
			}
			setPendingArea(skill);
		},
		[accessibleSkillIds, lockToOwnSkills, t]
	);

	const setSkill = (skill: SkillFormModel) => {
		setCheckedIds(prev => {
			const next = new Set(prev);
			if (next.has(skill.id)) next.delete(skill.id);
			else next.add(skill.id);
			return next;
		});
	};

	// Search hides rows; it must not rebuild the tree order.
	const orderedSkills = useMemo(() => orderSkillsByTree(skills), [skills]);
	const filteredSkills =
		search !== ""
			? orderedSkills.filter(skill => skill.name.toLowerCase().includes(search.toLowerCase()))
			: orderedSkills;
	// Membership filter. An already selected skill stays visible so it can be unchecked.
	const visibleSkills = filteredSkills.filter(skill => {
		if (!filterToOwnSkills) return true;
		// Locked list must not flash the full catalog while membership ids load.
		if (!accessibleSkillIds) {
			return !lockToOwnSkills || (selectedIds?.has(skill.id) ?? false);
		}
		return accessibleSkillIds.has(skill.id) || selectedIds?.has(skill.id);
	});

	function confirmAddChildren(confirmed: boolean) {
		const area = pendingArea;
		setPendingArea(null);
		if (!confirmed || !area) return;
		const children = directChildSkills(area, skillId =>
			skills.find(item => item.id === skillId)
		);
		const allowed: SkillFormModel[] = [];
		for (const child of children) {
			if (lockToOwnSkills && !accessibleSkillIds?.has(child.id)) {
				toastDeniedSkillAccess(t, child.name);
				continue;
			}
			allowed.push(child);
		}
		if (allowed.length === 0) return;
		setCheckedIds(prev => {
			const next = new Set(prev);
			for (const child of allowed) next.add(child.id);
			return next;
		});
	}

	return (
		<>
			{pendingArea && (
				<AddSkillChildrenDialog skillName={pendingArea.name} onClose={confirmAddChildren} />
			)}
			<SearchField
				placeholder={t("Skills_Search")}
				onChange={e => {
					setSearch(e.target.value);
				}}
			/>
			{!lockToOwnSkills && (
				<OnlyOwnSkillsCheckbox checked={onlyOwnSkills} onChange={setOnlyOwnSkills} />
			)}
			<div className="flex flex-col justify-between overflow-auto">
				<section className="flex h-64 flex-col rounded-lg border border-c-border p-4">
					<div className="flex flex-col">
						{skills.length === 0 && <p>{t("Skills_Empty")}</p>}
						{skills.length > 0 && (
							<>
								{visibleSkills.map((skill, index) => (
									<span
										key={skill.id + index}
										className="flex items-center gap-2"
									>
										<SkillElementMemorized
											skill={skill}
											value={checkedIds.has(skill.id)}
											setSkill={setSkill}
											allowSelectRoots={allowSelectRoots}
											onPickArea={
												allowSelectRoots ? undefined : pickSkillArea
											}
										/>
									</span>
								))}
							</>
						)}
					</div>
				</section>
			</div>
			<DialogActions onClose={onClose}>
				<button
					type="button"
					className="btn-primary"
					onClick={() => {
						const added: SkillFormModel[] = [];
						const removed: SkillFormModel[] = [];
						for (const skill of skills) {
							const wasSelected = selectedIds?.has(skill.id) ?? false;
							const isChecked = checkedIds.has(skill.id);
							if (isChecked && !wasSelected) added.push(skill);
							else if (!isChecked && wasSelected) removed.push(skill);
						}
						onClose({ added, removed });
					}}
				>
					{t("common:save")}
				</button>
			</DialogActions>
		</>
	);
}

const SkillElementMemorized = memo(SkillElement);

function SkillElement({
	skill,
	setSkill,
	value,
	allowSelectRoots = true,
	onPickArea
}: {
	skill: SkillFormModel;
	setSkill: (skill: SkillFormModel) => void;
	value: boolean;
	allowSelectRoots: boolean;
	onPickArea?: (skill: SkillFormModel) => void;
}) {
	const ctx = useContext(SkillResourceContext);
	const [checked, setChecked] = useState(value);

	useEffect(() => {
		setChecked(value);
	}, [value]);

	const isRequired = !!ctx?.lessonRequired.has(skill.id);
	const isProvided = !!ctx?.lessonProvided.has(skill.id);
	const isCourseRequired = !!ctx?.courseRequired.has(skill.id);
	const isCourseProvided = !!ctx?.courseProvided.has(skill.id);

	const isGroup = skill.children.length > 0;
	const isRepository = isGroup && skill.parents.length === 0;

	return (
		<>
			<input
				id={"checkbox:" + skill.id}
				type={"checkbox"}
				className="checkbox"
				checked={checked}
				onChange={() => {
					// A skill area is not attached. Ask to add its direct children instead.
					if (onPickArea && isRepository && isSkillArea(skill)) {
						onPickArea(skill);
						return;
					}
					if (!allowSelectRoots && isRepository) return;
					setChecked(!checked);
					setSkill(skill);
				}}
			/>
			<div className="flex">
				<SkillIcon isRepository={isRepository} isGroup={isGroup} />
				<label htmlFor={"checkbox:" + skill.id} className="text-sm font-semibold">
					<ConnectedSkill
						name={skill.name}
						enabled={!!ctx}
						isLessonProvided={isProvided}
						isLessonRequired={isRequired}
						isCourseProvided={isCourseProvided}
						isCourseRequired={isCourseRequired}
					/>
				</label>
			</div>
		</>
	);
}

// Preorder of the skill graph, same sibling order as the skill tree.
// Each skill is emitted once; `seen` also stops cycles.
function orderSkillsByTree(skills: SkillFormModel[]): SkillFormModel[] {
	const byId = new Map(skills.map(skill => [skill.id, skill]));
	const seen = new Set<string>();
	const ordered: SkillFormModel[] = [];
	const byChildrenLength = (left: SkillFormModel, right: SkillFormModel) =>
		compareSkills(
			{ numberChildren: left.children.length, name: left.name },
			{ numberChildren: right.children.length, name: right.name }
		);

	const visit = (skill: SkillFormModel) => {
		if (seen.has(skill.id)) return;
		seen.add(skill.id);
		ordered.push(skill);
		for (const child of skill.children
			.map(childId => byId.get(childId))
			.filter(isTruthy)
			.sort(byChildrenLength)) {
			visit(child);
		}
	};

	// A parent removed by excludeIds is absent from byId, so the child becomes a root.
	const roots = skills
		.filter(skill => skill.parents.every(parentId => !byId.has(parentId)))
		.sort(byChildrenLength);
	for (const root of roots) visit(root);
	// A cycle with no outside parent is not reachable from those roots.
	for (const skill of skills) visit(skill);
	return ordered;
}
