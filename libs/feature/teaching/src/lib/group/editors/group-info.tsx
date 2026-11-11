import { Chip, IconTextButton, SectionHeader } from "@self-learning/ui/common";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { Controller, useFormContext } from "react-hook-form";
import { GroupFormModel } from "../group-editor";
import { InputWithButton, LabeledField, useSlugify } from "@self-learning/ui/forms";
import { SearchGroupDialog, useDefaultGroup } from "../dialogs/search-group-dialog";
import { useEffect, useRef, useState } from "react";
import { ArrowsUpDownIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "next-i18next";

/**
 * GroupInfoEditor - Form section for editing basic group information (name, slug, parent).
 *
 * Note: Must be used within a form with field `GroupFormModel` in context.
 *
 * Usage: Renders within a group editor form to edit group name, auto-generate slug, and optionally
 * assign a parent group. If fillInSingleGroup is true and user has defaultGroupId, auto-selects that
 * group as parent on first render. Used in group creation and edit pages as a form section.
 *
 * UI: Text input for name, slug input with "Generate" button, parent group selector (button + chip)
 * Related: useDefaultGroup, SearchGroupDialog, GroupFormModel, slugify utility
 *
 * @param fillInSingleGroup - If true, auto-select user's default group as parent (one-time only)
 */
export function GroupInfoEditor({ fillInSingleGroup }: { fillInSingleGroup: boolean }) {
	const { t } = useTranslation("feature-teaching");
	const form = useFormContext<GroupFormModel>();
	const {
		getValues,
		register,
		resetField,
		control,
		formState: { errors }
	} = form;
	const [isGroupDialogOpen, setGroupDialogOpen] = useState(false);

	const session = useRequiredSession();
	const isAdmin = session.data?.user.role === "ADMIN";

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "name", "slug");

	// if user creates a group, and has default group set - preset group parent (once)
	const { data: defaultGroup, isLoading } = useDefaultGroup(
		fillInSingleGroup && !form.getValues("parent")
	);
	const isDefaultGroupApplied = useRef(false);
	useEffect(() => {
		// run once
		if (isDefaultGroupApplied.current || isLoading) return;
		isDefaultGroupApplied.current = true;
		// guard again because values may change between renders
		if (!fillInSingleGroup || !!getValues("parent")) return;
		if (!defaultGroup) return;
		// keeps form clean
		resetField("parent", {
			defaultValue: { id: defaultGroup.groupId, name: defaultGroup.name }
		});
	}, [defaultGroup, isLoading, resetField, getValues, fillInSingleGroup]);

	return (
		<CenteredSection>
			<SectionHeader
				title={t("Group_Basic_Info_Tab")}
				subtitle={t("Group_Basic_Info_Subtitle")}
			/>
			<div className="flex flex-col gap-4">
				<LabeledField label={t("Group_Name_Label")} error={errors.name?.message}>
					<input
						{...register("name")}
						type="text"
						className="textfield"
						placeholder={t("New_Group_Name_Placeholder")}
					/>
				</LabeledField>
				<LabeledField label={t("Group_Slug_Label")} error={errors.slug?.message}>
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
				<LabeledField label={t("Select_Parent_Group")}>
					<IconTextButton
						text={t("Select_Action")}
						icon={<ArrowsUpDownIcon className="icon h-5" />}
						className="btn-secondary"
						onClick={() => setGroupDialogOpen(true)}
					/>
					<Controller
						name="parent"
						control={control}
						render={({ field, fieldState }) => {
							const error = fieldState.error?.message;
							return (
								<>
									{field.value && (
										<Chip
											onRemove={() => {
												field.onChange(null);
											}}
											displayImage={false}
										>
											{field.value.name}
										</Chip>
									)}
									{!field.value && (
										<p className="text-sm text-light">
											{t("No_Parent_Group_Selected")}
										</p>
									)}
									{isGroupDialogOpen && (
										<SearchGroupDialog
											isOpen={isGroupDialogOpen}
											isGlobalSearch={isAdmin}
											exclude={field.value ? [field.value.id] : undefined}
											onClose={group => {
												setGroupDialogOpen(false);
												if (!group) return;
												field.onChange({
													id: group?.groupId,
													name: group?.name
												});
											}}
										/>
									)}
									{error && (
										<span className="px-4 text-xs text-red-500">{error}</span>
									)}
								</>
							);
						}}
					/>
				</LabeledField>
			</div>
		</CenteredSection>
	);
}
