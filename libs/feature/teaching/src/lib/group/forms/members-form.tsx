import { IconButton, SectionHeader } from "@self-learning/ui/common";
import { Controller, useFieldArray, useFormContext, useFormState } from "react-hook-form";
import { GroupFormModel } from "../group-editor";
import { CenteredSection } from "@self-learning/ui/layouts";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { GroupRole } from "@prisma/client";
import { useState } from "react";
import { GroupMemberAdd } from "../editors/group-members";
import { SearchUserDialog, UserSearchEntry } from "@self-learning/admin";

export function GroupMembersEditor() {
	const { control } = useFormContext<{ members: GroupFormModel["members"] }>();
	const editor = useFieldArray({
		name: "members",
		control
	});
	const { errors } = useFormState({ control });
	const error = errors.members?.message;

	const onSelectUser = (user?: UserSearchEntry) => {
		setSearchUserActive(false);
		if (!user) return;
		// check if already appended
		const duplicate = editor.fields.find(u => u.user.id === user.id);
		if (duplicate) return;
		//
		editor.append({
			user: { ...user, author: null },
			role: GroupRole.MEMBER,
			expiresAt: null
		});
	};

	const [searchUserActive, setSearchUserActive] = useState(false);

	// const [memberEditorActive, setMemberEditorActive] = useState(false);

	return (
		<CenteredSection>
			<SectionHeader
				title="Mitglieder*in"
				subtitle="Alle Mitglieder*innen dieser Gruppe."
				button={
					<IconButton
						text="Mitglieder*in hinzufügen"
						icon={<PlusIcon className="icon w-5" />}
						onClick={() => setSearchUserActive(true)}
					/>
				}
			/>
			{searchUserActive && (
				<SearchUserDialog open={searchUserActive} onClose={onSelectUser} />
			)}

			<div className="flex flex-col gap-2">
				{editor.fields.map((field, index) => (
					<Controller
						key={field.id}
						name={`members.${index}`}
						control={control}
						render={({ field, fieldState }) => (
							<div className="rounded border p-2 border-light-border">
								<GroupMemberAdd member={field.value} onChange={field.onChange} />
								<button
									type="button"
									title="Entfernen"
									className="rounded p-1 hover:bg-red-100 text-red-500"
									onClick={() => editor.remove(index)}
								>
									<TrashIcon className="h-4 w-4" />
								</button>
								{fieldState.error?.message && (
									<span className="px-4 text-xs text-red-500">
										{fieldState.error.message}
									</span>
								)}
							</div>
						)}
					/>
				))}
			</div>
			{error && <span className="px-4 text-xs text-red-500">{error}</span>}
		</CenteredSection>
	);
}
