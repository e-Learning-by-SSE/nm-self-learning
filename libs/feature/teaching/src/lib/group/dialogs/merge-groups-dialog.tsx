import {
	Chip,
	DetailsDropdown,
	Dialog,
	DialogActions,
	IconTextButton,
	OnDialogCloseFn
} from "@self-learning/ui/common";
import { useState } from "react";
import { GroupSearchEntry, SearchGroupDialog } from "./search-group-dialog";
import { PlusIcon } from "@heroicons/react/24/solid";
import { GenericCombobox } from "../editors/group-members";
import { InputWithButton, LabeledField, useSlugify } from "@self-learning/ui/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { MergeGroupsSchema, MergeGroupsType, MergeStrategy } from "@self-learning/types";
import { useTranslation } from "next-i18next";
import { z } from "zod";

export const MergeStrategyLabelKeys: Record<MergeStrategy, string> = {
	[MergeStrategy.First]: "Merge_Strategy_First",
	[MergeStrategy.Highest]: "Merge_Strategy_Highest",
	[MergeStrategy.Lowest]: "Merge_Strategy_Lowest"
};

/**
 * MergeGroupsDialog - Modal for merging multiple groups with a chosen permission strategy.
 *
 * Usage: Use to consolidate overlapping groups while preserving member data.
 * Opens a form to select 2+ groups to merge. Provides name and slug for the new merged group.
 * User chooses a merge strategy (first, highest, or lowest permission level). Creates a new group
 * entry; **old groups must be manually deleted after verification**.
 *
 * UI: Form with name/slug inputs, strategy selector (radio/combobox), group list with add button
 * (opens SearchGroupDialog), info section explaining strategies and requirements
 * Related: SearchGroupDialog, MergeGroupsType, MergeStrategy
 *
 * @param isOpen - Controls dialog visibility
 * @param isGlobal - If true, allows selecting from all groups; if false, only user's groups
 * @param onClose - Callback with MergeGroupsType (name, slug, strategy, selected groups) or undefined
 */
export function MergeGroupsDialog({
	isOpen,
	isGlobal,
	onClose
}: {
	isOpen: boolean;
	isGlobal: boolean;
	onClose: OnDialogCloseFn<MergeGroupsType>;
}) {
	const { t } = useTranslation("feature-teaching");
	const [isGroupDialogOpen, setGroupDialogOpen] = useState(false);
	const localizedSchema = MergeGroupsSchema.extend({
		name: z.string().min(3, t("Validation_Group_Name_Min")),
		slug: z.string().min(3, t("Validation_Group_Slug_Min")),
		groups: MergeGroupsSchema.shape.groups.min(2, t("Validation_Merge_Requires_Two_Groups"))
	});

	const form = useForm<MergeGroupsType>({
		resolver: zodResolver(localizedSchema),
		defaultValues: {
			strategy: MergeStrategy.First
		}
	});
	const editor = useFieldArray({
		name: "groups",
		control: form.control
	});

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "name", "slug");

	function onAddGroup(group?: GroupSearchEntry): void {
		setGroupDialogOpen(false);
		if (group && !editor.fields.find(g => g.groupId === group.groupId)) {
			editor.append({
				...group
			});
		}
	}

	const mergeStrategyOptions = Object.values(MergeStrategy).map(s => ({
		value: s,
		label: t(MergeStrategyLabelKeys[s])
	}));

	return (
		<Dialog open={isOpen} onClose={onClose} className="w-[90vw] flex-col lg:w-[800px]">
			<DetailsDropdown
				header={t("Merge_Groups_Title")}
				headerStyles="text-2xl"
				className="mb-4"
			>
				<MergeStrategyInfo />
			</DetailsDropdown>
			<form
				onSubmit={form.handleSubmit(onClose, console.log)}
				className="flex flex-col gap-4 overflow-auto"
			>
				<LabeledField
					label={t("Group_Name_Label")}
					error={form.formState.errors.name?.message}
				>
					<input
						{...form.register("name")}
						type="text"
						className="textfield"
						placeholder={t("New_Group_Name_Placeholder")}
					/>
				</LabeledField>
				<LabeledField
					label={t("Group_Slug_Label")}
					error={form.formState.errors.slug?.message}
				>
					<InputWithButton
						input={
							<input
								{...form.register("slug")}
								onBlur={slugifyIfEmpty}
								type="text"
								className="textfield"
								autoComplete="off"
							/>
						}
						button={
							<button type="button" className="btn-stroked" onClick={slugifyField}>
								{t("Generate_Slug")}
							</button>
						}
					/>
				</LabeledField>
				<LabeledField
					label={t("Merge_Strategy_Label")}
					error={form.formState.errors.strategy?.message}
				>
					<Controller
						control={form.control}
						name="strategy"
						render={({ field }) => (
							<GenericCombobox
								value={field.value}
								onChange={field.onChange}
								options={mergeStrategyOptions}
								label={t("Select_Action")}
							/>
						)}
					/>
				</LabeledField>
				<LabeledField
					label={t("Groups_To_Merge_Label")}
					error={form.formState.errors.groups?.root?.message}
				>
					<div className="flex gap-2 flex-wrap">
						{editor.fields.map((field, index) => (
							<Controller
								key={field.groupId}
								name={`groups.${index}`}
								control={form.control}
								render={({ field }) => (
									<Chip
										onRemove={() => editor.remove(index)}
										displayImage={false}
									>
										<div className="flex gap-1 items-center">
											<span className="text-lg">#{index + 1}</span>
											<div className="flex flex-col">
												{field.value.name}
												<span className="text-sm text-light">
													{field.value.slug || ""}
												</span>
											</div>
										</div>
									</Chip>
								)}
							/>
						))}
						<IconTextButton
							icon={<PlusIcon className="icon h-5" />}
							text={t("Add_Group_To_Merge_List")}
							className="btn-primary"
							title={t("Add_Group_To_Merge_List")}
							onClick={() => setGroupDialogOpen(true)}
						/>
					</div>
					{isGroupDialogOpen && (
						<SearchGroupDialog
							isOpen={isGroupDialogOpen}
							isGlobalSearch={isGlobal}
							onClose={onAddGroup}
							exclude={editor.fields.map(f => f.groupId)}
						/>
					)}
				</LabeledField>
				<DialogActions onClose={onClose}>
					<button className="btn-primary">{t("Merge_Groups_Action")}</button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

function MergeStrategyInfo() {
	const { t } = useTranslation("feature-teaching");
	return (
		<div className="mt-2 flex items-start gap-2 px-4 text-sm text-gray-700">
			<div className="flex-1 space-y-1">
				<p>{t("Merge_Strategy_Intro")}</p>
				<p>{t("Merge_Strategy_Explanation")}</p>
				<ul className="list-disc list-inside space-y-1">
					<li>{t("Merge_Strategy_First_Description")}</li>
					<li>{t("Merge_Strategy_Highest_Description")}</li>
					<li>{t("Merge_Strategy_Lowest_Description")}</li>
				</ul>
				<p className="font-semibold text-red-600">{t("Merge_Requires_Admin_Role")}</p>
			</div>
		</div>
	);
}
