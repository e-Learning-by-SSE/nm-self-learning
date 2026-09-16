/* eslint-disable react/jsx-no-useless-fragment */
import { SkillFormModel } from "@self-learning/types";
import { Dialog, DialogActions, LoadingBox, OnDialogCloseFn } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";
import { memo, useContext, useEffect, useState } from "react";
import { SearchField } from "@self-learning/ui/forms";
import { FolderIcon } from "@heroicons/react/24/solid";
import { SkillResourceContext } from "../skill-tree/skill-resource-context";
import { ConnectedSkill } from "../skill-tree/skill-row-editor";

export function SelectSkillDialog({
	onClose,
	skills: skillsFromParent,
	excludeIds
}: {
	onClose: OnDialogCloseFn<SkillFormModel[]>;
	skills?: SkillFormModel[];
	excludeIds?: ReadonlySet<string>;
}) {
	const ctx = useContext(SkillResourceContext);
	if (!ctx) console.warn("SelectSkillDialog: SkillResourceContext missing");

	const { data: fetched, isLoading } = trpc.skill.getSkills.useQuery(undefined, {
		enabled: !skillsFromParent
	});
	const skills = (skillsFromParent ?? (fetched as SkillFormModel[] | undefined) ?? []).filter(
		skill => !excludeIds?.has(skill.id)
	);

	return (
		<Dialog onClose={() => onClose(undefined)} title={"Füge die Skills hinzu"}>
			{!skillsFromParent && isLoading ? (
				<LoadingBox />
			) : (
				<>
					<SelectSkillForm
						onClose={onClose}
						//skills is missing some properties here
						skills={skills}
					/>
				</>
			)}
		</Dialog>
	);
}

function SelectSkillForm({
	onClose,
	skills
}: {
	onClose: OnDialogCloseFn<SkillFormModel[]>;
	skills: SkillFormModel[];
}) {
	const [search, setSearch] = useState("");
	// key by id — object identity breaks after getSkills refetch
	const [checkedIds, setCheckedIds] = useState(new Set<string>());

	const setSkill = (skill: SkillFormModel) => {
		setCheckedIds(prev => {
			const next = new Set(prev);
			if (next.has(skill.id)) next.delete(skill.id);
			else next.add(skill.id);
			return next;
		});
	};

	const filteredSkills =
		search !== ""
			? skills.filter(skill => skill.name.toLowerCase().includes(search.toLowerCase()))
			: skills;

	return (
		<>
			<SearchField
				placeholder="Suche nach Skills"
				onChange={e => {
					setSearch(e.target.value);
				}}
			/>
			<div className="flex flex-col justify-between overflow-auto">
				<section className="flex h-64 flex-col rounded-lg border border-c-border p-4">
					<div className="flex flex-col">
						{skills.length === 0 && <p>Keine Skills vorhanden</p>}
						{skills.length > 0 && (
							<>
								{filteredSkills
									.sort((a, b) => a.name.localeCompare(b.name))
									.map((skill, index) => (
										<span
											key={skill.id + index}
											className="flex items-center gap-2"
										>
											<SkillElementMemorized
												skill={skill}
												value={checkedIds.has(skill.id)}
												setSkill={setSkill}
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
						onClose(skills.filter(skill => checkedIds.has(skill.id)));
					}}
				>
					Speichern
				</button>
			</DialogActions>
		</>
	);
}

const SkillElementMemorized = memo(SkillElement);

function SkillElement({
	skill,
	setSkill,
	value
}: {
	skill: SkillFormModel;
	setSkill: (skill: SkillFormModel) => void;
	value: boolean;
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

	const isFolder = skill.children.length > 0;
	const isRoot = isFolder && skill.parents.length === 0;

	if (isRoot) return null; // do not allow to pick root skills for some reason

	return (
		<>
			<input
				id={"checkbox:" + skill.id}
				type={"checkbox"}
				className="checkbox"
				checked={checked}
				onChange={() => {
					setChecked(!checked);
					setSkill(skill);
				}}
			/>
			<div className="flex">
				<FolderIcon
					className={`h-5 ${isProvided ? "text-emerald-500" : ""} ${isFolder ? "" : "invisible"}`}
				/>
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
