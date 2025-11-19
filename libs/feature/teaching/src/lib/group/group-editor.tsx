"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEmptyGroup, Group, GroupFormSchema } from "@self-learning/types";
import { DialogActions, OnDialogCloseFn, showToast, Tab, Tabs } from "@self-learning/ui/common";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { OpenAsJsonButton } from "@self-learning/ui/forms";
import { useRouter } from "next/router";

export type GroupFormModel = Group;

export async function onGroupCreatorSubmit(
	onClose: () => void,
	createGroupAsync: (group: GroupFormModel) => Promise<{
		name: string;
		id: string;
	}>,
	group?: GroupFormModel
) {
	try {
		let result = null;
		if (group) {
			result = await createGroupAsync(group);
			showToast({ type: "success", title: "Gruppe erstellt", subtitle: result.name });
		}
		onClose();
		return result;
	} catch (error) {
		console.error(error);
		showToast({
			type: "error",
			title: "Fehler",
			subtitle: "Gruppe konnte nicht erstellt werden."
		});

		return null;
	}
}

export async function onGroupEditorSubmit(
	onClose: () => void,
	editGroupAsync: (group: {
		group: GroupFormModel;
		groupId: string;
	}) => Promise<{ title: string }>,
	group?: GroupFormModel
) {
	try {
		if (group) {
			const result = await editGroupAsync({
				group: group,
				groupId: group.id as string
			});
			showToast({
				type: "success",
				title: "Lerneinheit gespeichert!",
				subtitle: result.title
			});
		}
		onClose();
	} catch (error) {
		showToast({
			type: "error",
			title: "Fehler",
			subtitle: "Die Gruppe konnte nicht gespeichert werden."
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
	const isNew = !!initialGroup;
	const router = useRouter();
	const [selectedTab, setSelectedTab] = useState(0);
	const form = useForm<GroupFormModel>({
		context: undefined,
		defaultValues: initialGroup ?? {
			...createEmptyGroup()
		},
		resolver: zodResolver(GroupFormSchema)
	});

	function onCancel() {
		if (window.confirm("Änderungen verwerfen?")) {
			router.back();
		}
	}

	return (
		<FormProvider {...form}>
			<form
				id="lessonform"
				onSubmit={form.handleSubmit(onSubmit, console.log)}
				className="w-full bg-gray-100"
			>
				<div className="flex flex-col px-4 max-w-screen-xl mx-auto">
					<div className="flex justify-between mb-8">
						<div className="flex flex-col gap-2">
							<span className="font-semibold text-2xl text-secondary">
								{initialGroup ? "Gruppe bearbeiten" : "Gruppe erstellen"}
							</span>
							<h1 className="text-4xl">{initialGroup?.name}</h1>
						</div>
						<div className="pointer-events-auto">
							<DialogActions onClose={onCancel}>
								<OpenAsJsonButton form={form} validationSchema={GroupFormSchema} />
								<button type="submit" className="btn-primary pointer-events-auto">
									{isNew ? "Erstellen" : "Speichern"}
								</button>
							</DialogActions>
						</div>
					</div>
					<div>
						<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
							<Tab>Grunddaten</Tab>
							<Tab>Mitglieder</Tab>
							<Tab>Ressourcen</Tab>
							<Tab>Berechtigungen</Tab>
						</Tabs>
						{/* {selectedTab === 0 && <GroupInfoEditor />}
						{selectedTab === 1 && <GroupMembersElement isEditor={true} />}
						{selectedTab === 2 && <GroupResourcesEditor />}
						{selectedTab === 3 && <GroupGrantsEditor />} */}
					</div>
				</div>
			</form>
		</FormProvider>
	);
}
