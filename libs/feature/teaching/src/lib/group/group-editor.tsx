"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEmptyGroup, Group, GroupFormSchema } from "@self-learning/types";
import { DialogActions, OnDialogCloseFn, showToast, Tab, Tabs } from "@self-learning/ui/common";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { OpenAsJsonButton } from "@self-learning/ui/forms";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { z } from "zod";
import { GroupMembersEditor } from "./forms/members-form";
import { GroupPermissionsEditor } from "./forms/group-permissions";
import { GroupInfoEditor } from "./editors/group-info";

export type GroupFormModel = Group;

export async function onGroupCreatorSubmit(
	onClose: () => void,
	createGroupAsync: (group: GroupFormModel) => Promise<{
		name: string;
		id: number;
	}>,
	group: GroupFormModel | undefined,
	t: (key: string) => string
) {
	try {
		let result = null;
		if (group) {
			result = await createGroupAsync(group);
			showToast({ type: "success", title: t("Group_Created"), subtitle: result.name });
		}
		onClose();
		return result;
	} catch (error) {
		console.error(error);
		showToast({
			type: "error",
			title: t("Group_Save_Error_Title"),
			subtitle: t("Group_Create_Error_Message")
		});

		return null;
	}
}

export async function onGroupEditorSubmit(
	onClose: () => void,
	editGroupAsync: (group: {
		group: GroupFormModel;
		groupId: number;
	}) => Promise<{ title: string }>,
	group: GroupFormModel | undefined,
	t: (key: string) => string
) {
	try {
		if (group) {
			const result = await editGroupAsync({
				group: group,
				groupId: group.id as number
			});
			showToast({
				type: "success",
				title: t("Group_Saved"),
				subtitle: result.title
			});
		}
		onClose();
	} catch {
		showToast({
			type: "error",
			title: t("Group_Save_Error_Title"),
			subtitle: t("Group_Save_Error_Message")
		});
	}
}

export function GroupEditor({
	onSubmit,
	initialGroup
}: {
	onSubmit: OnDialogCloseFn<GroupFormModel>;
	initialGroup?: GroupFormModel;
}) {
	const isNew = !initialGroup?.id;
	const router = useRouter();
	const { t } = useTranslation("feature-teaching");
	const [selectedTab, setSelectedTab] = useState(0);
	const localizedSchema = GroupFormSchema.extend({
		name: z.string().min(3, t("Validation_Group_Name_Min")),
		slug: z.string().min(3, t("Validation_Group_Slug_Min")),
		members: GroupFormSchema.shape.members.element
			.extend({
				expiresAt: z.coerce
					.date()
					.nullable()
					.refine(date => !date || date > new Date(), {
						message: t("Validation_Membership_Expiration_Future")
					}) as z.ZodNullable<z.ZodDate>
			})
			.array()
	});
	const form = useForm<GroupFormModel>({
		context: undefined,
		defaultValues: initialGroup ?? {
			...createEmptyGroup()
		},
		resolver: zodResolver(localizedSchema)
	});

	function onCancel() {
		if (window.confirm(t("Group_Discard_Changes_Confirm"))) {
			router.back();
		}
	}

	return (
		<FormProvider {...form}>
			<form
				id="groupform"
				onSubmit={form.handleSubmit(onSubmit, console.log)}
				className="w-full bg-gray-100"
			>
				<div className="flex flex-col px-4 max-w-screen-xl mx-auto">
					<div className="flex justify-between mb-8">
						<div className="flex flex-col gap-2">
							<span className="font-semibold text-2xl text-secondary">
								{initialGroup ? t("Edit_Group") : t("Create_Group")}
							</span>
							<h1 className="text-4xl">{initialGroup?.name}</h1>
						</div>
						<div className="pointer-events-auto">
							<DialogActions onClose={onCancel}>
								<OpenAsJsonButton form={form} validationSchema={GroupFormSchema} />
								<button type="submit" className="btn-primary pointer-events-auto">
									{isNew ? t("Create_Action") : t("Save_Action")}
								</button>
							</DialogActions>
						</div>
					</div>
					<div>
						<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
							<Tab>{t("Group_Basic_Info_Tab")}</Tab>
							<Tab>{t("Group_Members_Tab")}</Tab>
							<Tab>{t("Group_Permissions_Tab")}</Tab>
						</Tabs>
						{/* I use hidden here to prevent useArrayDiff from losing diff data*/}
						<div className={selectedTab !== 0 ? "hidden" : undefined}>
							<GroupInfoEditor fillInSingleGroup={isNew} />
						</div>
						<div className={selectedTab !== 1 ? "hidden" : undefined}>
							<GroupMembersEditor />
						</div>
						<div className={selectedTab !== 2 ? "hidden" : undefined}>
							<GroupPermissionsEditor />
						</div>
						{/*{selectedTab === 3 && <GroupGrantsEditor />} */}
					</div>
				</div>
			</form>
		</FormProvider>
	);
}
