import { IconTextButton, SectionHeader } from "@self-learning/ui/common";
import { Controller, useFieldArray, useFormContext, useFormState } from "react-hook-form";
import { GroupFormModel } from "../group-editor";
import { CenteredSection } from "@self-learning/ui/layouts";
import { PlusIcon } from "@heroicons/react/24/solid";
import { GroupRole } from "@prisma/client";
import { useState } from "react";
import { GroupMemberRowEditor, GroupMemberTable } from "../editors/group-members";
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

	// TODO errors are not shown because members is array of objects

	return (
		<CenteredSection>
			<SectionHeader
				title="Mitglieder*in"
				subtitle="Alle Mitglieder*innen dieser Gruppe."
				button={
					<IconTextButton
						text="Mitglieder*in hinzufügen"
						icon={<PlusIcon className="icon w-5" />}
						onClick={() => setSearchUserActive(true)}
					/>
				}
			/>
			{searchUserActive && (
				<SearchUserDialog open={searchUserActive} onClose={onSelectUser} />
			)}

			<GroupMemberTable>
				{editor.fields.map((field, index) => (
					<Controller
						key={field.id}
						name={`members.${index}`}
						control={control}
						render={({ field, fieldState }) => (
							<>
								<GroupMemberRowEditor
									member={field.value}
									onChange={field.onChange}
									onDelete={() => editor.remove(index)}
								/>
								{fieldState.error?.message && (
									<tr>
										<td colSpan={100} className="bg-red-50 rounded-lg">
											<span className="px-2 py-1 text-xs text-red-500">
												{fieldState.error.message}
											</span>
										</td>
									</tr>
								)}
							</>
						)}
					/>
				))}
			</GroupMemberTable>
			{error && <span className="px-4 text-xs text-red-500">{error}</span>}
		</CenteredSection>
	);
}
